# Webgen: Interactive Apps With (Relative) Ease


Webgen provides a way to generate interactive applications using web technology. The documentation not only describes how webgen specifications work, but gives detailed instructions for using it. 

Although I describe webgen here as a UI tool, since it works by creating a website, that aspect of it gets some attention, both here and in the documentation. Formally, a webgen app runs in a browser but uses a `localhost` address. However, nothing prevents you from accessing arbitrary URLs in your code, and very little prevents you from modifying the generated web server from listening on a public URL instead of localhost. On the other hand, there's absolutely nothing in webgen about accounts, cookies, security, or most of the other things that concern "real" website deployment.

### Installation

Of course, d8m should be installed first. It should suffice to say

    sudo make install

Also, as mentioned in the webgen documentation, webgen runs **pandoc** in certain cases; it's a good idea to install pandoc before trying to use webgen, especially with the distributed examples.

Installing webgen installs an executable named `webgen`. Webgen comes with a set of _standard components_; installation copies these to `~/Library/Application\ Support/D8m/Webgen` and webgen expects to find them there. There are also two d8m modules to help with the server side of webgen specifications: `charthelp` and `md2html`. (Footnote: as distributed, `webgen/modules` includes these two files and two others, which are imported by webgen.d8m. In other words, `webgen/modules` contains both public facing modules for webgen apps, and webgen source code.) You'll be able to import these with the `webgen` prefix, e.g.

    import "webgen/charthelp" melted
This is intended to make it easier to reuse the chart setup code in perfsisShow. You'll still need to copy (javascript and pagespec) code from the spec for perfsisShow and modify as needed. 

### Issues

1. Webgen is supposed to determine all component dependencies and copy the needed files to the `src/` directory. It has code to check for changes and recopy if the source component is newer than the one in the create-react-app `src/` directory. However, it's not completely reliable, especially about components imported by components (aka "indirect dependencies"). You can work around this quite easily by copying any missing components to `src/` manualliy.
2. Nice documentation for the built in components is missing. For now, you'll need to go to the component source files to determine what props they accept. 

### Tests

There is a tests directory in the distribution containing a test for the charthelp module. See `tests/README.md` for details. 
