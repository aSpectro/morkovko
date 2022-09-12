#!/bin/bash
set -e

NAME="";
PASSWORD=""

# docker rm // не юзать на проде

echo "echo stop & remove old docker [$NAME] and starting new fresh instance of [$NAME]"
(docker kill $SERVER || :) && \
  (docker rm $SERVER || :) && \
  docker run -d --name $NAME -p 6379:6379 redis redis-server --requirepass $PASSWORD \

# wait for redis to start
echo "sleep wait for redis-server [$NAME] to start";
sleep 3;