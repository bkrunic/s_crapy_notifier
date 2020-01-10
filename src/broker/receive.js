#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var mailService=require('../mailService/mailSender');


const receive = (subscriber) => {
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

            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
            channel.consume(queue, function (msg) {
                   mailService(msg.content.toString(),subscriber).catch(console.error);;
            }, {
                noAck: false
            });

        })
    })
};
module.exports = receive;
