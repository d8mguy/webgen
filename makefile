
# install should be run with sudo

execdir = /usr/local/bin
mdir = $(PWD)/modules/


webgen:	webgen.d8m
	d8mc webgen.d8m

install:
	mkdir -p ${HOME}/Library/Application\ Support/D8m/Webgen
	cp -p -r components ${HOME}/Library/Application\ Support/D8m/Webgen/
	cp -p -r modules ${HOME}/Library/Application\ Support/D8m/Webgen/
	d8mc -addmod="webgen,$(mdir)"
	d8mc webgen.d8m
	mv webgen $(execdir)

