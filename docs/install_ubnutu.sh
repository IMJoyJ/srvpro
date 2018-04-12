#!/bin/bash

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
echo "deb http://download.mono-project.com/repo/ubuntu xenial main" | sudo tee /etc/apt/sources.list.d/mono-official.list
echo y | sudo apt-get update -y
echo y | sudo apt-get install -y curl git build-essential libreadline-dev libsqlite3-dev mono-complete

curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
echo y | sudo apt-get install -y nodejs 
sudo npm install pm2 -g

cd ~

mkdir lib
cd lib

wget https://nchc.dl.sourceforge.net/project/p7zip/p7zip/16.02/p7zip_16.02_src_all.tar.bz2 --no-check-certificate
tar jxvf p7zip_16.02_src_all.tar.bz2
cd p7zip_16.02
sudo make all3 install
cd ..

wget http://download.redis.io/releases/redis-4.0.8.tar.gz --no-check-certificate
tar xzfv redis-4.0.8.tar.gz
cd redis-4.0.8
make
sudo make install
cp -rf src/redis-server ..
cd ..
pm2 start redis-server

wget 'http://www.lua.org/ftp/lua-5.3.4.tar.gz' --no-check-certificate
tar zxf lua-5.3.4.tar.gz
cd lua-5.3.4
sudo make linux test install
cd ..

wget 'http://downloads.sourceforge.net/project/premake/Premake/4.4/premake-4.4-beta5-src.zip?r=&ts=1457170593&use_mirror=nchc' -O premake-4.4-beta5-src.zip --no-check-certificate
7z x -y premake-4.4-beta5-src.zip
cd premake-4.4-beta5/build/gmake.unix/
make
cd ../../bin/release/
sudo cp premake4 /usr/bin/
cd ../../../

wget 'https://github.com/libevent/libevent/releases/download/release-2.0.22-stable/libevent-2.0.22-stable.tar.gz' -O libevent-2.0.22-stable.tar.gz --no-check-certificate
tar xf libevent-2.0.22-stable.tar.gz
cd libevent-2.0.22-stable/
./configure
make
sudo make install
sudo ln -s /usr/local/lib/libevent-2.0.so.5 /usr/lib/libevent-2.0.so.5
sudo ln -s /usr/local/lib/libevent-2.0.so.5 /usr/lib64/libevent-2.0.so.5
sudo ln -s /usr/local/lib/libevent_pthreads-2.0.so.5 /usr/lib/libevent_pthreads-2.0.so.5
sudo ln -s /usr/local/lib/libevent_pthreads-2.0.so.5 /usr/lib64/libevent_pthreads-2.0.so.5
cd ..

cd ..

git clone https://github.com/purerosefallen/ygopro-server ygopro-server
cd ygopro-server
npm install
cp -rf config_build config
mkdir decks decks_save replays

git clone https://github.com/purerosefallen/ygopro --branch=server --recursive
cd ygopro/
premake4 gmake
cd ocgcore/
git checkout master
cd ../script/
git checkout master
cd ../build/
make config=release
cd ..
ln -s bin/release/ygopro ./
strip ygopro
mkdir replay
cd ..

git clone https://github.com/purerosefallen/windbot
cd windbot
echo y | xbuild /property:Configuration=Release
ln -s bin/Release/WindBot.exe .
ln -s ../ygopro/cards.cdb .
pm2 start pm2.json
cd ..

pm2 start ygopro-server.js
pm2 start ygopro-webhook.js
