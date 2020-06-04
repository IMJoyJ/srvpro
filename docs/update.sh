#!/bin/bash

export PROCESS_COUNT=$(grep -c "processor" /proc/cpuinfo)

git fetch origin dc-random
git reset --hard FETCH_HEAD
cd ..
cd windbot
git fetch origin master
git reset --hard FETCH_HEAD
xbuild /property:Configuration=Release /property:TargetFrameworkVersion="v4.5"
cd ../ygopro
export NO_SIDE_CHECK
git fetch origin server
git reset --hard FETCH_HEAD
git submodule foreach git fetch origin master
git submodule foreach git reset --hard FETCH_HEAD
~/premake5 gmake
cd build
make config=release -j$PROCESS_COUNT
cd ../
strip ygopro
cd ../
