#!/usr/bin/env sh

# don't put this stuff in command history
set +o history

# abort on errors
set -e

# test
npm run unit

# build
npm run build

# navigate into the build output directory
cd dist

# make git repository
git init
git add -A
git commit -m 'deploy' -q

# push to github
git remote add origin-pages git@github.com:shoftee/observable-sorrow.git
git branch -M local-deploy
git push --force origin-pages local-deploy:gh-pages

cd -

# turn history back on
set -o history