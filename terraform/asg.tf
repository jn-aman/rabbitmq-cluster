resource "aws_launch_template" "rabbitmq_lt" {
  name_prefix   = "rabbitmq-"
  image_id      = data.aws_ami.rabbitmq.id
  instance_type = var.instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.rabbitmq_profile.name
  }

  vpc_security_group_ids = [aws_security_group.rabbitmq_sg.id]
  user_data = base64encode(templatefile("${path.module}/userdata.tpl", {
    vhost                 = var.vhost
    rabbitmq_secret_arn   = aws_secretsmanager_secret.rabbitmq_credentials.arn
    monitoring_secret_arn = aws_secretsmanager_secret.rabbitmq_monitoring_credentials.arn

  }))

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = var.disk_size
      volume_type = "gp3"
    }
  }
  update_default_version = true
}

resource "aws_autoscaling_group" "rabbitmq_asg" {
  name                      = "rabbitmq-asg"
  desired_capacity          = var.desired_capacity
  max_size                  = var.max_size
  min_size                  = var.min_size
  vpc_zone_identifier       = data.aws_subnets.private.ids

  launch_template {
    id      = aws_launch_template.rabbitmq_lt.id
    version = "$Latest"
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      instance_warmup = 120
      min_healthy_percentage = 50
    }
  }

  tag {
    key                 = "Name"
    value               = "rabbitmq-node"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

