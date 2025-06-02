resource "null_resource" "build_lambda" {
  # This trigger causes the build to re-run when any file under lambda/src changes.
  triggers = {
    lambda_src_checksum = filesha256("${path.module}/../lambda/src/handler.ts")
    package_json        = filesha256("${path.module}/../lambda/package.json")
  }

  provisioner "local-exec" {
    working_dir = "${path.module}/../lambda"
    command     = "yarn install && yarn run prepare"
  }
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/dist"
  output_path = "${path.module}/../lambda/dist.zip"

  depends_on = [null_resource.build_lambda]
}
