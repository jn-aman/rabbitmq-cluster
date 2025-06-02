#!/bin/bash
rabbitmq-plugins --offline enable rabbitmq_peer_discovery_aws
sudo systemctl start rabbitmq-server
rabbitmqctl add_vhost ${vhost}
rabbitmqctl set_policy ha-all -p ${vhost} ".*" '{"ha-mode":"all", "ha-sync-mode":"automatic"}'

# Retrieve and configure credentials
username=$(aws secretsmanager get-secret-value --secret-id ${rabbitmq_secret_arn} | jq -r '.SecretString' | jq -r '.username')
password=$(aws secretsmanager get-secret-value --secret-id ${rabbitmq_secret_arn} | jq -r '.SecretString' | jq -r '.password')
rabbitmqctl add_user $username $password
rabbitmqctl set_user_tags $username administrator
rabbitmqctl set_permissions -p ${vhost} $username ".*" ".*" ".*"

mon_user=$(aws secretsmanager get-secret-value --secret-id ${monitoring_secret_arn} | jq -r '.SecretString' | jq -r '.username')
mon_pass=$(aws secretsmanager get-secret-value --secret-id ${monitoring_secret_arn} | jq -r '.SecretString' | jq -r '.password')
rabbitmqctl add_user $mon_user $mon_pass
rabbitmqctl set_user_tags $mon_user monitoring
rabbitmqctl set_permissions -p ${vhost} $mon_user "^aliveness-test$" "^amq\\.default$" ".*"

rabbitmq-plugins enable rabbitmq_management
