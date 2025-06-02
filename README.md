# Self-Hosted RabbitMQ Cluster

This repository provides scripts and configurations to deploy a self-hosted RabbitMQ cluster on AWS. It uses **Packer** to build a custom AMI with RabbitMQ installed and **Terraform** to create and manage the cluster infrastructure.

---

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) (configured with your credentials)
- [Ansible](https://www.ansible.com/)
- [Packer](https://www.packer.io/)
- [Terraform](https://www.terraform.io/)

---

## Deployment Steps

### 1. Configure AWS CLI

Set up your AWS credentials:

```
aws configure
```

You’ll be prompted to enter:

- AWS Access Key ID
- AWS Secret Access Key
- Default region name
- Default output format

---

### 2. Install Ansible

Install Ansible via pip:

```
pip install ansible
```

Or refer to the official Ansible installation guide:  
https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html

---

### 3. Install Packer and Required Plugins

Install Packer:  
Download and install from https://www.packer.io/downloads

Install the necessary Packer plugins:

```
packer plugins install github.com/hashicorp/amazon
packer plugins install github.com/hashicorp/ansible
```

---

### 4. Update Configuration in `rabbitmq.json`

Edit the `rabbitmq.json` file in the root directory and update these values:

- `security_group_id`
- `vpc_id`
- `subnet_id`

Ensure they reflect your AWS environment.

---

### 5. Build the RabbitMQ AMI

From the root directory, run:

```
RABBITMQ_VERSION=3.12.12 packer build rabbitmq.json
```

⚠️ Note:
- Wait for the AMI build process to complete.
- Save the generated AMI ID for later use.

---

### 6. Configure Terraform

Navigate to the `terraform` directory:

```
cd terraform
```

Update the `variables.tf` file with the desired values, including:

- VPC ID
- Subnet ID(s)
- AMI ID (from the Packer build)
- Other relevant configurations

---

### 7. Initialize and Apply Terraform

Initialize Terraform:

```
terraform init
```

Generate an execution plan:

```
terraform plan -out=tfplan
```

Apply the plan to provision the RabbitMQ cluster:

```
terraform apply tfplan
```

---

## Notes

- This setup automates the process of building a custom RabbitMQ AMI and deploying a self-hosted cluster on AWS.
- Ensure you have appropriate IAM permissions for AMI creation and EC2 infrastructure management.
- Carefully review and adapt the configuration files for your environment.


---

## Contributing

Contributions, issues, and feature requests are welcome!  
Please open an issue or submit a pull request.

---

## Contact

For questions or feedback, please open an issue on GitHub or reach out directly.

---

## Run performance Test

sudo docker run -it --rm --network host pivotalrabbitmq/perf-test:latest \
  --uri amqp://<username>:<password>@<NLB URL>:5672 \
  -x 10 -y 2 -u "throughput-test-1" -a --id "test-1" \
  --verbose

---