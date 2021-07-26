const fetch = require('node-fetch');

const Lbry = {
    isConnected: false,
    connectPromise: null,
    daemonConnectionString: 'http://localhost:5279',
    alternateConnectionString: '',
    methodsUsingAlternateConnectionString: [],
    apiRequestHeaders: { 'Content-Type': 'application/json-rpc' },

    // Allow overriding daemon connection string (e.g. to `/api/proxy` for lbryweb)
    setDaemonConnectionString: value => {
        Lbry.daemonConnectionString = value;
    },

    setApiHeader: (key, value) => {
        Lbry.apiRequestHeaders = Object.assign(Lbry.apiRequestHeaders, { [key]: value });
    },

    unsetApiHeader: key => {
        Object.keys(Lbry.apiRequestHeaders).includes(key) && delete Lbry.apiRequestHeaders['key'];
    },
    // Allow overriding Lbry methods
    overrides: {},
    setOverride: (methodName, newMethod) => {
        Lbry.overrides[methodName] = newMethod;
    },
    getApiRequestHeaders: () => Lbry.apiRequestHeaders,

    // Returns a human readable media type based on the content type or extension of a file that is returned by the sdk
    getMediaType: (contentType, fileName) => {
        if (fileName) {
            const formats = 
            [
                [/\.(mp4|m4v|webm|flv|f4v|ogv)$/i, 'video'],
                [/\.(mp3|m4a|aac|wav|flac|ogg|opus)$/i, 'audio'],
                [/\.(jpeg|jpg|png|gif|svg|webp)$/i, 'image'],
                [/\.(h|go|ja|java|js|jsx|c|cpp|cs|css|rb|scss|sh|php|py)$/i, 'script'],
                [/\.(html|json|csv|txt|log|md|markdown|docx|pdf|xml|yml|yaml)$/i, 'document'],
                [/\.(pdf|odf|doc|docx|epub|org|rtf)$/i, 'e-book'],
                [/\.(stl|obj|fbx|gcode)$/i, '3D-file'],
                [/\.(cbr|cbt|cbz)$/i, 'comic-book'],
                [/\.(lbry)$/i, 'application']
            ];

            const res = formats.reduce((ret, testpair) => {
                switch (testpair[0].test(ret)) {
                    case true:
                        return testpair[1];
                    default:
                        return ret;
                }
            }, fileName);
            return res === fileName ? 'unknown' : res;
        } else if (contentType) {
            // $FlowFixMe
            return (/^[^/]+/.exec(contentType)[0]
            );
        }

        return 'unknown';
    },

    //
    // Lbry SDK Methods
    // https://lbry.tech/api/sdk
    //

    // MAIN
    ffmpeg_find: (params = {}) => daemonCallWithResult('ffmpeg_find', params),
    get: (params = {}) => daemonCallWithResult('get', params),
    publish: (params = {}) => new Promise((resolve, reject) => {
        if (Lbry.overrides.publish) {
            Lbry.overrides.publish(params).then(resolve, reject);
        } else {
            apiCall('publish', params, resolve, reject);
        }
    }),
    resolve: (params = {}) => daemonCallWithResult('resolve', params),
    routing_table_get: (params = {}) => daemonCallWithResult('routing_table_get', params),
    status: (params = {}) => daemonCallWithResult('status', params),
    stop: (params = {}) => daemonCallWithResult('stop', params),
    version: (params = {}) => daemonCallWithResult('version', params),

    // ACCOUNT
    account_add: (params = {}) => daemonCallWithResult('account_add', params),
    account_balance: (params = {}) => daemonCallWithResult('account_balance', params),
    account_create: (params = {}) => daemonCallWithResult('account_create', params),
    account_fund: (params = {}) => daemonCallWithResult('account_fund', params),
    account_list: (params = {}) => daemonCallWithResult('account_list', params),
    account_max_address_gap: (params = {}) => daemonCallWithResult('account_max_address_gap', params),
    account_remove: (params = {}) => daemonCallWithResult('account_remove', params),
    account_send: (params = {}) => daemonCallWithResult('account_send', params),
    account_set: (params = {}) => daemonCallWithResult('account_set', params),
    
    // ADDRESS
    address_is_mine: (params = {}) => daemonCallWithResult('address_is_mine', params),
    address_list: (params = {}) => daemonCallWithResult('address_list', params),
    address_unused: (params = {}) => daemonCallWithResult('address_unused', params),

    // BLOB
    blob_announce: (params = {}) => daemonCallWithResult('blob_announce', params),
    blob_delete: (params = {}) => daemonCallWithResult('blob_delete', params),
    blob_get: (params = {}) => daemonCallWithResult('blob_get', params),
    blob_list: (params = {}) => daemonCallWithResult('blob_list', params),
    blob_reflect: (params = {}) => daemonCallWithResult('blob_reflect', params),
    blob_reflect_all: (params = {}) => daemonCallWithResult('blob_reflect_all', params),

    // CHANNEL
    channel_abandon: (params = {}) => daemonCallWithResult('channel_abandon', params),
    channel_create: (params = {}) => daemonCallWithResult('channel_create', params),
    channel_export: (params = {}) => daemonCallWithResult('channel_export', params),
    channel_import: (params = {}) => daemonCallWithResult('channel_import', params),
    channel_list: (params = {}) => daemonCallWithResult('channel_list', params),
    channel_sign: (params = {}) => daemonCallWithResult('channel_sign', params),
    channel_update: (params = {}) => daemonCallWithResult('channel_update', params),

    // CLAIM
    claim_list: (params = {}) => daemonCallWithResult('claim_list', params),
    claim_search: (params = {}) => daemonCallWithResult('claim_search', params),

    // COLLECTION
    collection_abandon: (params = {}) => daemonCallWithResult('collection_abandon', params),
    collection_create: (params = {}) => daemonCallWithResult('collection_create', params),
    collection_list: (params = {}) => daemonCallWithResult('collection_list', params),
    collection_resolve: (params = {}) => daemonCallWithResult('collection_resolve', params),
    collection_update: (params = {}) => daemonCallWithResult('collection_update', params),

    // COMMENT
    comment_abandon: (params = {}) => daemonCallWithResult('comment_abandon', params),
    comment_create: (params = {}) => daemonCallWithResult('comment_create', params),
    comment_hide: (params = {}) => daemonCallWithResult('comment_hide', params),
    comment_list: (params = {}) => daemonCallWithResult('comment_list', params),
    comment_pin: (params = {}) => daemonCallWithResult('comment_pin', params),
    comment_react: (params = {}) => daemonCallWithResult('comment_react', params),
    comment_react_list: (params = {}) => daemonCallWithResult('comment_react_list', params),
    comment_update: (params = {}) => daemonCallWithResult('comment_update', params),

    // FILE
    file_delete: (params = {}) => daemonCallWithResult('file_delete', params),
    file_list: (params = {}) => daemonCallWithResult('file_list', params),
    file_reflect: (params = {}) => daemonCallWithResult('file_reflect', params),
    file_save: (params = {}) => daemonCallWithResult('file_save', params),
    file_set_status: (params = {}) => daemonCallWithResult('file_set_status', params),

    // PEER
    peer_list: (params = {}) => daemonCallWithResult('peer_list', params),
    peer_ping: (params = {}) => daemonCallWithResult('peer_ping', params),

    // PREFERENCE
    preference_get: (params = {}) => daemonCallWithResult('preference_get', params),
    preference_set: (params = {}) => daemonCallWithResult('preference_set', params),

    // PURCHASE
    purchase_create: (params = {}) => daemonCallWithResult('purchase_create', params),
    purchase_list: (params = {}) => daemonCallWithResult('purchase_list', params),

    // SETTINGS
    settings_clear: (params = {}) => daemonCallWithResult('settings_clear', params),
    settings_get: (params = {}) => daemonCallWithResult('settings_get', params),
    settings_set: (params = {}) => daemonCallWithResult('settings_set', params),

    // STREAM
    stream_abandon: (params = {}) => daemonCallWithResult('stream_abandon', params),
    stream_cost_estimate: (params = {}) => daemonCallWithResult('stream_cost_estimate', params),
    stream_create: (params = {}) => daemonCallWithResult('stream_create', params),
    stream_list: (params = {}) => daemonCallWithResult('stream_list', params),
    stream_repost: (params = {}) => daemonCallWithResult('stream_repost', params),
    stream_update: (params = {}) => daemonCallWithResult('stream_update', params),

    // SUPPORT
    support_abandon: (params = {}) => daemonCallWithResult('support_abandon', params),
    support_create: (params = {}) => daemonCallWithResult('support_create', params),
    support_list: (params = {}) => daemonCallWithResult('support_list', params),
    support_sum: (params = {}) => daemonCallWithResult('support_sum', params),

    // SYNC
    sync_apply: (params = {}) => daemonCallWithResult('sync_apply', params),
    sync_hash: (params = {}) => daemonCallWithResult('sync_hash', params),

    // TRACEMALLOC
    tracemalloc_disable: (params = {}) => daemonCallWithResult('tracemalloc_disable', params),
    tracemalloc_enable: (params = {}) => daemonCallWithResult('tracemalloc_enable', params),
    tracemalloc_top: (params = {}) => daemonCallWithResult('tracemalloc_top', params),

    // TRANSACTION
    transaction_list: (params = {}) => daemonCallWithResult('transaction_list', params),
    transaction_show: (params = {}) => daemonCallWithResult('transaction_show', params),

    // TXO
    txo_list: (params = {}) => daemonCallWithResult('txo_list', params),
    txo_plot: (params = {}) => daemonCallWithResult('txo_plot', params),
    txo_spend: (params = {}) => daemonCallWithResult('txo_spend', params),
    txo_sum: (params = {}) => daemonCallWithResult('txo_sum', params),

    // UTXO
    utxo_list: (params = {}) => daemonCallWithResult('utxo_list', params),
    utxo_release: (params = {}) => daemonCallWithResult('utxo_release', params),

    // WALLET
    wallet_add: (params = {}) => daemonCallWithResult('wallet_add', params),
    wallet_balance: (params = {}) => daemonCallWithResult('wallet_balance', params),
    wallet_create: (params = {}) => daemonCallWithResult('wallet_create', params),
    wallet_decrypt: (params = {}) => daemonCallWithResult('wallet_decrypt', params),
    wallet_encrypt: (params = {}) => daemonCallWithResult('wallet_encrypt', params),
    wallet_list: (params = {}) => daemonCallWithResult('wallet_list', params),
    wallet_lock: (params = {}) => daemonCallWithResult('wallet_lock', params),
    wallet_reconnect: (params = {}) => daemonCallWithResult('wallet_reconnect', params),
    wallet_remove: (params = {}) => daemonCallWithResult('wallet_remove', params),
    wallet_send: (params = {}) => daemonCallWithResult('wallet_send', params),
    wallet_status: (params = {}) => daemonCallWithResult('wallet_status', params),
    wallet_unlock: (params = {}) => daemonCallWithResult('wallet_unlock', params),










    // Connect to the sdk
    connect: () => {
        if (Lbry.connectPromise === null) {
            Lbry.connectPromise = new Promise((resolve, reject) => {
                let tryNum = 0;
                const CHECK_DAEMON_STARTED_TRY_NUMBER = 120 // 1 minute
                // Check every half second to see if the daemon is accepting connections
                function checkDaemonStarted() {
                    tryNum += 1;
                    Lbry.status().then(resolve).catch(() => {
                        if (tryNum <= CHECK_DAEMON_STARTED_TRY_NUMBER) {
                            setTimeout(checkDaemonStarted, tryNum < 50 ? 400 : 1000);
                        } else {
                            reject(new Error('Unable to connect to LBRY'));
                        }
                    });
                }

                checkDaemonStarted();
            });
        }

        // Flow thinks this could be empty, but it will always reuturn a promise
        // $FlowFixMe
        return Lbry.connectPromise;
    },
};

function checkAndParse(response) {
    if (response.status >= 200 && response.status < 300) {
        return response.json();
    }
    return response.json().then(json => {
        let error;
        if (json.error) {
            const errorMessage = typeof json.error === 'object' ? json.error.message : json.error;
            error = new Error(errorMessage);
        } else {
            error = new Error('Protocol error with unknown response signature');
        }
        return Promise.reject(error);
    });
}

function apiCall(method, params, resolve, reject) {
    const counter = new Date().getTime();
    const options = {
        method: 'POST',
        headers: Lbry.apiRequestHeaders,
        body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id: counter
        })
    };

    const connectionString = Lbry.methodsUsingAlternateConnectionString.includes(method) ? Lbry.alternateConnectionString : Lbry.daemonConnectionString;
    return fetch(connectionString + '?m=' + method, options).then(checkAndParse).then(response => {
        const error = response.error || response.result && response.result.error;

        if (error) {
            return reject(error);
        }
        return resolve(response.result);
    }).catch(reject);
}

function daemonCallWithResult(name, params = {}) {
    return new Promise((resolve, reject) => {
        apiCall(name, params, result => {
            resolve(result);
        }, reject);
    });
}
module.exports = exports = { Lbry: Lbry };