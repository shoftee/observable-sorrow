#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

# make git repository
git init
git add -A
git commit -m 'deploy' -q

# push to github
git remote add origin git@github.com:shoftee/observable-sorrow.git
git branch -M main
git push --force origin main:gh-pages

cd -