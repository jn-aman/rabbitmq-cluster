import axios from "axios";
import CloudWatch from "@aws-sdk/client-cloudwatch";

import logger from "../config/logger";
import { NodeInfo, RabbitMqProps } from "../handler/interfaces";

const getNodeInfo = async (
    rabbitMqProps: RabbitMqProps
): Promise<NodeInfo[]> => {
    const tag = "getNodeInfo";
    try {
        return (
            await axios.get<NodeInfo[]>(
                `${rabbitMqProps.rabbitMqUrl}/api/nodes`,
                rabbitMqProps.rabbitMqAxiosConfig
            )
        ).data;
    } catch (error) {
        logger.error(`Error while getting node information`, { error, tag });
        return [];
    }
};

export const getMemoryMetrics = async (
    rabbitMqProps: RabbitMqProps
): Promise<CloudWatch.MetricDatum[]> => {
    const tag = "getMemoryMetrics";
    /**
     * Get all the node information
     */
    try {
        const nodes = await getNodeInfo(rabbitMqProps);

        const nodeLevelMetric: CloudWatch.MetricDatum[] = nodes.flatMap(
            ({
                name: nodeName,
                ["mem_limit"]: memLimit,
                ["mem_used"]: memUsed
            }) => {
                return [
                    {
                        MetricName: "RabbitMQMemLimit",
                        Dimensions: [
                            { Name: "Node", Value: nodeName },
                            {
                                Name: "Broker",
                                Value: `rabbitmq-${process.env.stage}`
                            }
                        ],
                        Unit: "None",
                        Value: memLimit || 0
                    },
                    {
                        MetricName: "RabbitMQMemUsed",
                        Dimensions: [
                            { Name: "Node", Value: nodeName },
                            {
                                Name: "Broker",
                                Value: `rabbitmq-${process.env.stage}`
                            }
                        ],
                        Unit: "None",
                        Value: memUsed || 0
                    }
                ];
            }
        );

        const totalMemUsed = nodes.reduce(
            (sum, node) => sum + (node.mem_used || 0),
            0
        );
        const totalMemLimit = nodes.reduce(
            (sum, node) => sum + (node.mem_limit || 0),
            0
        );

        if (totalMemLimit === 0) {
            logger.error(
                `Total memory limit is 0. Cannot calculate memory percentage`
            );
            return nodeLevelMetric;
        }

        const aggregateMemPercent = (totalMemUsed / totalMemLimit) * 100;

        const aggregateMemoryMetric: CloudWatch.MetricDatum[] = [
            {
                MetricName: "AvgRabbitMQMemPercent",
                Dimensions: [
                    {
                        Name: "Broker",
                        Value: `rabbitmq-${process.env.stage}`
                    }
                ],
                Unit: "None",
                Value: aggregateMemPercent
            }
        ];

        return [...nodeLevelMetric, ...aggregateMemoryMetric];
    } catch (error) {
        logger.error(`Error while getting node information`, { error, tag });
        return [];
    }
};
