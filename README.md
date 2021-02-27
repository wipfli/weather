# weather
Provide read access to weather station measurements

## Installation

Write a ```weather.service``` file:

```
[Unit]
Description=Provide read access to weather station measurements

[Service]
WorkingDirectory=/root/weather
Environment=PORT=3005
ExecStart=node index.js
Restart=always
TimeoutStopSec=30
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
npm install
```

test with

```bash
PORT=3005 node index.js
```

install with

```bash
systemctl enable /root/weather/weather.service
systemctl start weather
```
