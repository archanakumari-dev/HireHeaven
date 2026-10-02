import {Kafka, type Admin, type Producer} from 'kafkajs';
let admin:Admin;
let producer:Producer;


export const connectKafka=async()=>{
    try {
        const kafka=new Kafka({
            clientId:"auth-service",
            brokers:[process.env.KAFKA_BROKER || '13.60.76.240:9092']
        })

        admin=kafka.admin();
        await admin.connect();

        const topics=await admin.listTopics();

        if(!topics.includes('send-mail')){
            await admin.createTopics({
                topics:[
                    {
                      topic:'send-mail',
                      numPartitions:1,
                      replicationFactor:1  
                    }
                ]
            });
            console.log("Topic created successfully ✅");
        }

        await admin.disconnect();
       
        producer=kafka.producer();
        await producer.connect();

        console.log("✅ Connected to Kafka Producer.") 
    } catch (error) {
        console.log("❌ Failed to cennect to kafka.")
    }
}

export const publishToTopic=async(topic:string,message:any)=>{
     if(!producer){
        console.log("Producer not initialized.");
        return;
     }

     try {
        await producer.send({
            topic:topic,
            messages:[
                {
                    value:JSON.stringify(message)
                }
            ]
        })
        console.log('Message published successfully.')
     } catch (error) {
        console.log("Failed to publish message to kafka.",error);
     }
}

export const disconnectKafka=()=>{
    if(producer){
        producer.disconnect();
    }
}