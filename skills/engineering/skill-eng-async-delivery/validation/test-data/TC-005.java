// TC-005: Kafka dependent events dispatched without partition keys (out-of-order execution)
package com.example.messaging;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderEventPublisher {

    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    public OrderEventPublisher(KafkaTemplate<String, OrderEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishOrderUpdate(OrderEvent event) {
        // Defect ASY05: Round-robin partition assignment without partition key causes out-of-order event consumption
        kafkaTemplate.send("order-updates", event);
    }
}

