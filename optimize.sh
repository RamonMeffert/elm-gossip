#!/bin/bash

set -e
outdir="./dist"
srcdir="./src/elm"
js=$outdir/"elm.js"
min=$outdir/"elm.min.js"
elm="./node_modules/elm/bin/elm"
uglify="./node_modules/uglify-js/bin/uglifyjs"

# Build the Elm app
$elm make $srcdir/Main.elm --quiet --optimize --output=$js

echo "Minifying..."

# Minify the generated js
$uglify $js --compress "pure_funcs=[F2,F3,F4,F5,F6,F7,F8,F9,A2,A3,A4,A5,A6,A7,A8,A9],pure_getters,keep_fargs=false,unsafe_comps,unsafe" | $uglify --mangle --output $min

fs_B=`cat $js | wc -c | awk '{print $1}'`
fs_kB=`echo "scale=1; $fs_B / 1000" | bc`

min_B=`cat $min | wc -c | awk '{print $1}'`
min_kB=`echo "scale=1; $min_B / 1000" | bc`

gz_B=`cat $min | gzip -c | wc -c | awk '{print $1}'`
gz_kB=`echo "scale=1; $gz_B / 1000" | bc`

savings=`echo $fs_B - $min_B | bc`
perc=`echo "100 - ($min_B * 100 / $fs_B)" | bc`

gz_savings=`echo $min_B - $gz_B | bc`
gz_perc=`echo "100 - ($gz_B * 100 / $min_B)" | bc`

tot_perc=`echo "100 - ($gz_B * 100 / $fs_B)" | bc`

echo
echo "Succes! Minifying the file yielded a $perc% reduction in file size."
echo "Gzipping would yield a further $gz_perc% reduction, for a total of $tot_perc%."
echo
echo "    Original:    $fs_kB kB"
echo "    Minified:    $min_kB kB"
echo "    Gzipped:     $gz_kB kB"
echo "    Output:      $min"

# Remove the non-minified file
rm $js