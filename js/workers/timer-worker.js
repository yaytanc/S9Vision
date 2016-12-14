/**
 * Created by Muratd on 16/04/2016.
 */
var intervalIds = {};

self.onmessage = function(e) {
    switch (e.data.command) {
        case 'timeout:start':
            setTimeout(function() {
                postMessage({
                    message: 'timeout:tick',
                    id: e.data.id
                });
            }, e.data.interval);
            break;
        case 'timeout:clear':
            clearTimeout(intervalIds[e.data.id]);

            postMessage({
                message: 'timeout:cleared',
                id: e.data.id
            });

            intervalIds[e.data.id] = -1;
            break;
        case 'interval:start':
            var intvalId = setInterval(function() {
                postMessage({
                    message: 'interval:tick',
                    id: e.data.id
                });
            }, e.data.interval);

            postMessage({
                message: 'interval:started',
                id: e.data.id
            });

            intervalIds[e.data.id] = intvalId;
            break;

        case 'interval:clear':
            clearInterval(intervalIds[e.data.id]);

            postMessage({
                message: 'interval:cleared',
                id: e.data.id
            });

            intervalIds[e.data.id] = -1;
            break;
    }
};
