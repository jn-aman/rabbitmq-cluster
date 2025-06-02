RABBITMQ_VERSION=3.12.12 packer build rabbitmq.json

Run perf test:
sudo docker run -it --rm --network host pivotalrabbitmq/perf-test:latest \
  --uri amqp://<username>:<password>@<NLB URL>:5672 \
  -x 10 -y 2 -u "throughput-test-1" -a --id "test-1" \
  --verbose
