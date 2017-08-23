/**
 * Copyright 2017, Andre Gott.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');

const Datastore = require('@google-cloud/datastore');

// Instantiates a client
//const datastore = Datastore();
// Your Google Cloud Platform project ID
const projectId = 'vocal-entity-170715';

// Instantiates a client
const datastore = Datastore({
    projectId: projectId
});

/**
 * Gets a Datastore key from the kind/key pair in the request.
 *
 * @param {object} requestData Cloud Function request data.
 * @param {string} requestData.key Datastore key string.
 * @param {string} requestData.kind Datastore kind.
 * @returns {object} Datastore key object.
 */
function getKeyFromRequestData(requestData) {
    if (!requestData.key) {
        //throw new Error('username not provided. Make sure you have a "key" property in your request: ' + JSON.stringify(requestData.body));
        throw new Error('Key not provided. Make sure you have a "key" property in your request: ' + JSON.stringify(requestData.body));
    }


    if (!requestData.kind) {
        throw new Error('Kind not provided. Make sure you have a "kind" property in your request ' + JSON.stringify(requestData.body));
    }

    return datastore.key([requestData.kind, requestData.key]);
}

/**
 * Creates and/or updates a record.
 *
 * @example
 * gcloud beta functions call set --data '{"kind":"Task","key":"sampletask1","value":{"description": "Buy milk"}}'
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.kind The Datastore kind of the data to save, e.g. "Task".
 * @param {string} req.body.key Key at which to save the data, e.g. "sampletask1".
 * @param {object} req.body.value Value to save to Cloud Datastore, e.g. {"description":"Buy milk"}
 * @param {object} res Cloud Function response context.
 */

/*
function set(req, res) {
    console.log('set');
    // The value contains a JSON document representing the entity we want to save
    if (!req.body.value) {
        throw new Error('Value not provided. Make sure you have a "value" property in your request');
    }

    const key = getKeyFromRequestData(req.body);
    const entity = {
        key: key,
        data: req.body.value
    };

    return datastore.save(entity)
        .then(() => res.status(200).send(`Entity ${key.path.join('/')} saved.`))
        .catch((err) => {
            console.error(err);
            res.status(500).send(err);
            return Promise.reject(err);
        });
};
*/

/**
 * Retrieves a record.
 *
 * @example
 * gcloud beta functions call chat --data '{"kind":"Task","key":"sampletask1"}' --header "Content-Type: application/json"
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.kind The Datastore kind of the data to retrieve, e.g. "Task".
 * @param {string} req.body.key Key at which to retrieve the data, e.g. "sampletask1".
 * @param {object} res Cloud Function response context.
 */
exports.chat = function chat(req, res) {    
    console.log('id: ' + req.params.id);
    console.log('req.body: ' + req.body);
    console.log(datastore.key(['Text', 5639445604728832]));

    /* if GET verb */
    if (!Object.keys(req.body).length) {
        console.log('GET');
        /* Parse params to grab the /chat/:ID */
        const query = datastore.createQuery('Text')
            .filter('id', '=', req.params.id)
            .order('id', { descending: true })

        datastore.runQuery(query)
            .then((results) => {
                // Task entities found.
                const texts = results[0];

                console.log('Text:');
                texts.forEach((text) => console.log(text));

                console.log(texts);
                res.status(200).send(texts);
            }
        );
    }
    else {
        console.log('POST');
        console.log(req.body);
        newChat(req, res);
    }
     
};

function newChat(req, res) {

    var username, textmessage, timeout;
    if (req.body.timeout == '') timeout = '60'; else timeout = req.body.timeout;
    if (req.body.username == '') res.status(500);
    if (req.body.text == '') res.status(500);

    const text = {
        id: getRandomInt(100, 10000).toString(),
        username: req.body.username,
        text: req.body.text,
        timeout: req.body.timeout,
        created_date: Date.now(),
        expiration_date: Date.now() + (req.body.timeout * 1000),
        read: false,
        expired: false
    };

    const entity = {
        key: datastore.key('Text'),
        data: text
    };

    datastore.insert(entity)
        .then(() => {
            // inserted successfully.
            const returnValue = {
                id: text.id
            };
            res.status(201).send(returnValue);
        });
}

exports.chats = function chats(req, res) {
    var value;
    const usernames = [], expiration_dates = [], texts = [];
    console.log(req.params.username);

    const query = datastore.createQuery('Text')
        //.select('expiration_date')
        .filter('username', '=', req.params.username)
        //.order('username', { descending: true })
        ;

    datastore.runQuery(query)
        .then((results) => {
            // Task entities found.
            const texts = results[0];

            console.log('Text:');
            texts.forEach((text) => console.log(text));

            console.log(texts);
            res.status(200).send(texts);
        }
    );

};  


exports.getOnKey = function get(req, res) {
    const key = getKeyFromRequestData(req.body);

    return datastore.get(key)
        .then(([entity]) => {
            // The get operation will not fail for a non-existent entity, it just returns null.
            if (!entity) {
                throw new Error(`No entity found for key ${key.path.join('/')}.`);
            }

            console.log(entity);
            //res.status(200).send(entity);
            res.send(entity);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(err);
            return Promise.reject(err);
        });
};

/**
 * Deletes a record.
 *
 * @example
 * gcloud beta functions call del --data '{"kind":"Task","key":"sampletask1"}'
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.kind The Datastore kind of the data to delete, e.g. "Task".
 * @param {string} req.body.key Key at which to delete data, e.g. "sampletask1".
 * @param {object} res Cloud Function response context.
 */
exports.del = function del(req, res) {
    const key = getKeyFromRequestData(req.body);

    // Deletes the entity
    return datastore.delete(key)
        .then(() => res.status(200).send(`Entity ${key.path.join('/')} deleted.`))
        .catch((err) => {
            console.error(err);
            res.status(500).send(err);
            return Promise.reject(err);
        });
};


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}