## Tests of chart data extraction

The code in this directory tests the module in webgen/modules/charthelp.d8m. This is normally accessed with 

    import "webgen/charthelp" melted
and it exports a type `xJsonT` that adds a `extractChartData` method to the usual json encoder. 

This module encapsulates the server side code needed to extract data from a collection of `.csv` files via the chart setup UI in perfsisShow. It exists to facilitate other webgen apps using the same chart setup UI, or at least, the same transition protocol for extracting the data for a given chart. 

Json encoding of the extracted chart data is tricky because it involves types not describable in d8m. To understand how to use the charthelp module, refer first to the webgen spec for perfsisShow; it's also used in the perfsis/tests directory. 

The tests here pertain specifically to charthelp, they set up artificial calls as if from the webgen client, and verify the returned values against expectations. It can therefore serve as a regression test for any changes to charthelp as well as documentation of how the module is supposed to be used.

