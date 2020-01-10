#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
const send=(data)=> {
    amqp.connect('amqp://dhyahuzi:EjVT7sEI_P1Z2CKbr0V0ZMTPC41-xw7D@hawk.rmq.cloudamqp.com/dhyahuzi', function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }

            var queue = 'data';

            channel.assertQueue(queue, {
                durable: false
            });
            channel.sendToQueue(queue, Buffer.from(data));

            console.log(" [x] Sent %s", data);
        });
        setTimeout(function () {
            connection.close();
        }, 20000);
    });
}
module.exports=send;
