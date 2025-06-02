resource "aws_lb" "rabbitmq_nlb" {
  name               = "rabbitmq-nlb"
  internal           = true
  load_balancer_type = "network"
  subnets            = data.aws_subnets.private.ids
  security_groups = [
    aws_security_group.rabbitmq_sg.id
  ]
}

resource "aws_lb_target_group" "rabbitmq_tg" {
  name     = "rabbitmq-tg"
  port     = 5672
  protocol = "TCP"
  vpc_id   = var.vpc_id

  health_check {
    protocol = "TCP"
  }
}
resource "aws_lb_target_group" "rabbitmq_tg_management" {
  name     = "rabbitmq-tg-management"
  port     = 15672
  protocol = "TCP"
  vpc_id   = var.vpc_id

  health_check {
    protocol = "TCP"
  }
}

resource "aws_lb_listener" "rabbitmq_listener" {
  load_balancer_arn = aws_lb.rabbitmq_nlb.arn
  port              = 5672
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.rabbitmq_tg.arn
  }
}




resource "aws_lb_listener" "rabbitmq_listener_management" {
  load_balancer_arn = aws_lb.rabbitmq_nlb.arn
  port              = 15672
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.rabbitmq_tg_management.arn
  }
}

