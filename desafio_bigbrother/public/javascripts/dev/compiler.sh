for f in *.js; do
    java -jar ../../../closure\ compiler/compiler.jar --js=$f --js_output_file=../$f
done