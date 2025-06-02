import { CloudWatch, MetricDatum } from "@aws-sdk/client-cloudwatch";
import { SecretsManager } from "@aws-sdk/client-secrets-manager";
import { Context, Callback } from "aws-lambda";

import logger from "./config/logger";

import { getMemoryMetrics } from "./metrics/nodeBasedMetric";
import { getAllQueuesGroupByVhost } from "./metrics/queueBasedMetric";

import { RabbitMqAxiosConfig, RabbitMqConfig } from "./handler/interfaces";

const updateCloudWatchMetrics = async (
    metricData: MetricDatum[]
): Promise<void> => {
    /**
     * Update CloudWatch metrics
     */
    const namespace = process.env.namespace || "AWS/AmazonMQ";
    try {
        const cloudWatchClient = new CloudWatch();

        logger.debug(`Putting the following metrics to CloudWatch`, {
            metricData
        });

        await cloudWatchClient.putMetricData({
            Namespace: namespace,
            MetricData: metricData
        });
    } catch (error) {
        logger.error(`Error while updating cloudwatch metrics`, {
            error,
            metricData
        });
    }
};

export const lambdaHandler = async (
    event: RabbitMqConfig,
    context: Context,
    callback: Callback<Error>
): Promise<void> => {
    if (!process.env.rabbitMqUrl || !process.env.secretArn) {
        logger.error(
            `Bad request. Ensure that rabbitMqUrl and secretArn are present in the request`
        );
        /**
         * Using callback to send error back to the invoker (synchronous).
         * https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html
         */
        callback(
            new Error(
                "Bad request. Ensure that rabbitMqUrl and secretArn are present in the request"
            )
        );
        return;
    }

    const rabbitMqSecretArn = process.env.secretArn;

    try {
        const secretManagerClient = new SecretsManager();

        const rabbitMqSecretValue = await secretManagerClient.getSecretValue({
            SecretId: rabbitMqSecretArn
        });

        const rabbitMqCredentials =
            rabbitMqSecretValue.SecretString &&
            (JSON.parse(rabbitMqSecretValue.SecretString) as {
                password: string;
                username: string;
            });

        if (
            rabbitMqCredentials &&
            rabbitMqCredentials.username &&
            rabbitMqCredentials.password
        ) {
            const rabbitMqAxiosConfig: RabbitMqAxiosConfig = {
                auth: {
                    username: rabbitMqCredentials.username,
                    password: rabbitMqCredentials.password
                },
                headers: { "Content-Type": "application/json" }
            };

            const rabbitMqConfig = {
                rabbitMqUrl: `${process.env.rabbitMqUrl}`,
                rabbitMqAxiosConfig
            };

            const allQueuesGroupByVhostMetricData = await getAllQueuesGroupByVhost(
                rabbitMqConfig
            );

            await updateCloudWatchMetrics(allQueuesGroupByVhostMetricData);

            const memoryMetrics = await getMemoryMetrics(rabbitMqConfig);
            await updateCloudWatchMetrics(memoryMetrics);
        } else {
            logger.error(
                `Could not fetch RabbitMQ credentials from secret ${rabbitMqSecretArn}`
            );
            callback(
                new Error(
                    `Could not fetch RabbitMQ credentials from secret ${rabbitMqSecretArn}`
                )
            );
        }
    } catch (error) {
        logger.error(`Error while configuring RabbitMQ`, { error });
        callback(new Error(`Error while configuring RabbitMQ: ${error}`));
    }
};

export const handler = lambdaHandler;
