package main

import (
	"bytes"
	"context"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type DockerClient struct {
	client     *http.Client
	socketPath string
}

func NewDockerClient(socket string) *DockerClient {
	return &DockerClient{
		socketPath: socket,
		client: &http.Client{
			Timeout: 45 * time.Second,
			Transport: &http.Transport{
				DialContext: func(ctx context.Context, _, _ string) (net.Conn, error) {
					return net.DialTimeout("unix", socket, 3*time.Second)
				},
				DisableKeepAlives: true,
			},
		},
	}
}

func (d *DockerClient) call(ctx context.Context, method, endpoint string, body any, out any) error {
	u := fmt.Sprintf("http://localhost/v1.44%s", endpoint)
	var reader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return err
		}
		reader = bytes.NewReader(b)
	}

	req, err := http.NewRequestWithContext(ctx, method, u, reader)
	if err != nil {
		return err
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := d.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("docker API error (%d): %s", resp.StatusCode, string(b))
	}
	if out != nil {
		return json.NewDecoder(resp.Body).Decode(out)
	}
	return nil
}

func (d *DockerClient) Ping(ctx context.Context) error {
	req, _ := http.NewRequestWithContext(ctx, "GET", "http://localhost/_ping", nil)
	resp, err := d.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("status %d", resp.StatusCode)
	}
	return nil
}

// System
func (d *DockerClient) GetInfo(ctx context.Context) (map[string]any, error) {
	var info map[string]any
	return info, d.call(ctx, "GET", "/info", nil, &info)
}

func (d *DockerClient) GetVersion(ctx context.Context) (map[string]any, error) {
	var ver map[string]any
	return ver, d.call(ctx, "GET", "/version", nil, &ver)
}

// Containers
func (d *DockerClient) ListContainers(ctx context.Context, all bool) ([]map[string]any, error) {
	var list []map[string]any
	path := "/containers/json"
	if all {
		path += "?all=1"
	}
	return list, d.call(ctx, "GET", path, nil, &list)
}

func (d *DockerClient) StartContainer(ctx context.Context, id string) error {
	return d.call(ctx, "POST", fmt.Sprintf("/containers/%s/start", id), nil, nil)
}

func (d *DockerClient) StopContainer(ctx context.Context, id string) error {
	return d.call(ctx, "POST", fmt.Sprintf("/containers/%s/stop?t=10", id), nil, nil)
}

func (d *DockerClient) RestartContainer(ctx context.Context, id string) error {
	return d.call(ctx, "POST", fmt.Sprintf("/containers/%s/restart?t=10", id), nil, nil)
}

func (d *DockerClient) RemoveContainer(ctx context.Context, id string, force bool) error {
	return d.call(ctx, "DELETE", fmt.Sprintf("/containers/%s?force=%t&v=true", id, force), nil, nil)
}

func (d *DockerClient) PruneContainers(ctx context.Context) error {
	return d.call(ctx, "POST", "/containers/prune", nil, nil)
}

func (d *DockerClient) InspectContainer(ctx context.Context, id string) (map[string]any, error) {
	var inspect map[string]any
	return inspect, d.call(ctx, "GET", fmt.Sprintf("/containers/%s/json", id), nil, &inspect)
}

func (d *DockerClient) GetLogs(ctx context.Context, id string, tail string) (string, error) {
	if tail == "" {
		tail = "250"
	}
	u := fmt.Sprintf("http://localhost/v1.44/containers/%s/logs?stdout=1&stderr=1&tail=%s", id, tail)
	req, err := http.NewRequestWithContext(ctx, "GET", u, nil)
	if err != nil {
		return "", err
	}
	resp, err := d.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	return demuxLogs(raw), nil
}

type RunContainerPayload struct {
	Image         string   `json:"image"`
	Name          string   `json:"name"`
	Ports         string   `json:"ports"`
	Env           []string `json:"env"`
	RestartPolicy string   `json:"restartPolicy"`
}

func (d *DockerClient) RunContainer(ctx context.Context, p RunContainerPayload) (string, error) {
	if strings.TrimSpace(p.Image) == "" {
		return "", errors.New("image name is required")
	}

	portsMap := make(map[string]struct{})
	bindings := make(map[string][]map[string]string)

	if p.Ports != "" {
		for _, part := range strings.Split(p.Ports, ",") {
			part = strings.TrimSpace(part)
			segs := strings.Split(part, ":")
			if len(segs) == 2 {
				cPort := strings.TrimSpace(segs[1])
				if !strings.Contains(cPort, "/") {
					cPort += "/tcp"
				}
				portsMap[cPort] = struct{}{}
				bindings[cPort] = []map[string]string{{"HostPort": strings.TrimSpace(segs[0])}}
			}
		}
	}

	restart := "unless-stopped"
	if p.RestartPolicy != "" {
		restart = p.RestartPolicy
	}

	body := map[string]any{
		"Image":        p.Image,
		"ExposedPorts": portsMap,
		"Env":          p.Env,
		"HostConfig": map[string]any{
			"PortBindings":  bindings,
			"RestartPolicy": map[string]string{"Name": restart},
		},
	}

	path := "/containers/create"
	if p.Name != "" {
		path += "?name=" + url.QueryEscape(p.Name)
	}

	var res struct {
		ID string `json:"Id"`
	}
	if err := d.call(ctx, "POST", path, body, &res); err != nil {
		return "", err
	}

	// Auto-start container
	return res.ID, d.StartContainer(ctx, res.ID)
}

// Images
func (d *DockerClient) ListImages(ctx context.Context) ([]map[string]any, error) {
	var list []map[string]any
	return list, d.call(ctx, "GET", "/images/json", nil, &list)
}

func (d *DockerClient) PullImage(ctx context.Context, img string) error {
	u := fmt.Sprintf("http://localhost/v1.44/images/create?fromImage=%s", url.QueryEscape(img))
	req, _ := http.NewRequestWithContext(ctx, "POST", u, nil)
	resp, err := d.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	_, _ = io.Copy(io.Discard, resp.Body)
	if resp.StatusCode >= 400 {
		return fmt.Errorf("pull failed with status %d", resp.StatusCode)
	}
	return nil
}

func (d *DockerClient) RemoveImage(ctx context.Context, id string, force bool) error {
	return d.call(ctx, "DELETE", fmt.Sprintf("/images/%s?force=%t", id, force), nil, nil)
}

// Volumes
func (d *DockerClient) ListVolumes(ctx context.Context) ([]map[string]any, error) {
	var res struct {
		Volumes []map[string]any `json:"Volumes"`
	}
	return res.Volumes, d.call(ctx, "GET", "/volumes", nil, &res)
}

func (d *DockerClient) CreateVolume(ctx context.Context, name string) error {
	return d.call(ctx, "POST", "/volumes/create", map[string]string{"Name": name}, nil)
}

func (d *DockerClient) RemoveVolume(ctx context.Context, name string) error {
	return d.call(ctx, "DELETE", fmt.Sprintf("/volumes/%s", name), nil, nil)
}

// Networks
func (d *DockerClient) ListNetworks(ctx context.Context) ([]map[string]any, error) {
	var list []map[string]any
	return list, d.call(ctx, "GET", "/networks", nil, &list)
}

// Helper: Demux Docker multiplexed logs
func demuxLogs(raw []byte) string {
	if len(raw) == 0 {
		return ""
	}
	var b strings.Builder
	idx := 0
	for idx+8 <= len(raw) {
		if raw[idx] == 1 || raw[idx] == 2 {
			size := binary.BigEndian.Uint32(raw[idx+4 : idx+8])
			idx += 8
			if idx+int(size) <= len(raw) {
				b.Write(raw[idx : idx+int(size)])
				idx += int(size)
				continue
			}
		}
		break
	}
	if b.Len() > 0 {
		return b.String()
	}
	return string(raw)
}
