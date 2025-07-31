import yaml
import requests

def load_resources(yaml_path):
    with open(yaml_path, 'r') as f:
        return yaml.safe_load(f)

def check_url(url, timeout=5):
    try:
        r = requests.head(url, allow_redirects=True, timeout=timeout)
        status = r.status_code
        return status
    except requests.RequestException:
        return None

def scan_resources(resources):
    dead = []
    intermittent = []
    for item in resources['resources']:
        name = item.get('name')
        url = item.get('url')
        status = check_url(url)
        if status is None or (status >= 400 and status < 600):
            print(f"\033[91mERROR\033[0m: {url} ({status})\n")
            dead.append({
                'name': name,
                'url': url,
                'status': status or 'error'
            })
    return dead

def output_yaml(dead_links):
    return yaml.dump({'dead_links': dead_links}, sort_keys=False)

import sys
if __name__ == '__main__':
    res = load_resources(sys.argv[1])
    dead = scan_resources(res)
    print(output_yaml(dead))
