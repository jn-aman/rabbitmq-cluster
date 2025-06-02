export interface RabbitMqAxiosConfig {
    auth: {
        username: string;
        password: string;
    };
    headers: Record<string, string>;
}

export interface RabbitMqConfig {
    rabbitMqUrl: string;
    secretArn: string;
}

export interface RabbitMqProps {
    rabbitMqUrl: string;
    rabbitMqAxiosConfig: RabbitMqAxiosConfig;
}

export interface NodeInfo {
    ["mem_limit"]: number;
    ["mem_used"]: number;
    ["mem_alarm"]: boolean;
    name: string;
}

export interface QueueInfo {
    ["messages_ready"]: number;
    ["messages"]: number;
    name: string;
    vhost: string;
}

export interface VhostQueues {
    [vhost: string]: {
        [queueName: string]: {
            readyMessages: number;
            messages: number;
        };
    };
}
