import axios from "axios";
import CloudWatch from "@aws-sdk/client-cloudwatch";

import logger from "../config/logger";

import { QueueInfo, RabbitMqProps, VhostQueues } from "../handler/interfaces";

const convertVhostToQueueToMetricData = (
    vhostQueues: VhostQueues
): CloudWatch.MetricDatum[] => {
    let metricData: CloudWatch.MetricDatum[] = [];

    for (const [vhost, queues] of Object.entries(vhostQueues)) {
        for (const [queue, { readyMessages, messages }] of Object.entries(
            queues
        )) {
            logger.debug(
                `Queue: ${queue}    Vhost: ${vhost}    Ready Messages: ${readyMessages}    Messages: ${messages}`
            );

            const queueMetricData: CloudWatch.MetricDatum[] = [
                {
                    MetricName: "MessageReadyCount",
                    Dimensions: [
                        { Name: "Queue", Value: queue },
                        {
                            Name: "VirtualHost",
                            Value: vhost
                        },
                        {
                            Name: "Broker",
                            Value: `rabbitmq-${process.env.stage}`
                        }
                    ],
                    Unit: "None",
                    Value: readyMessages
                },
                {
                    MetricName: "MessageCount",
                    Dimensions: [
                        { Name: "Queue", Value: queue },
                        {
                            Name: "VirtualHost",
                            Value: vhost
                        },
                        {
                            Name: "Broker",
                            Value: `rabbitmq-${process.env.stage}`
                        }
                    ],
                    Unit: "None",
                    Value: messages
                }
            ];
            metricData = [...metricData, ...queueMetricData];
        }
    }
    return metricData;
};
export const getAllQueuesGroupByVhost = async (
    vhostProps: RabbitMqProps
): Promise<CloudWatch.MetricDatum[]> => {
    const tag = "getAllQueuesGroupByVhost";
    try {
        /**
         * Get queues for all the Vhosts
         */
        logger.debug(
            `Get queues for all the Vhosts in RabbitMq Host: ${vhostProps.rabbitMqUrl}`
        );
        const queueInfo = (
            await axios.get<QueueInfo[]>(
                `${vhostProps.rabbitMqUrl}/api/queues`,
                vhostProps.rabbitMqAxiosConfig
            )
        ).data;

        const vhostQueues: VhostQueues = {};

        queueInfo.forEach(queue => {
            const vhostName = queue.vhost;
            const queueName = queue.name;
            const readyMessages = queue.messages_ready || 0;
            const messages = queue.messages || 0;

            if (!(vhostName in vhostQueues)) {
                vhostQueues[vhostName] = {};
            }

            vhostQueues[vhostName][queueName] = {
                readyMessages,
                messages
            };
        });

        return convertVhostToQueueToMetricData(vhostQueues);
    } catch (error) {
        logger.error(
            `Error in getting queues for all the Vhosts in RabbitMq Host: ${vhostProps.rabbitMqUrl}`,
            { error, tag }
        );
        return [];
    }
};
