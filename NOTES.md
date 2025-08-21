### Optimization Notes

 > ***DONT CHECK THE PERFORMANCE WHILE THE NETWORK TAB IS OPEN IN THE DEV TOOLS, IT CAUSES MAJOR PERFORMANCE PROBLEMS WHILE LOADING TILES FROM THE SERVER***

 > [Performance optimizations for Deck.gl](https://deck.gl/docs/developer-guide/performance)

 - Layers are drawn according to the layer list. The first one will be under the others. BE AWARE.
 - Use data chunks when loading the data into the map. (max 200k data per layer). Iterate over the chunks to generate the layers for features.
    ```js
        const [data, setData] = useState(someData);

        const layers = data.map((dataChunk) => new Layer(data: dataChunk));
    ```
 - Use `useMemo` hook to avoid recalculation where applicable but **MUST NOT** use `useMemo` in the layer. Use `updateTrigger` instead.
 - Use `visible` prop to toggle visibility.
 - Most layers have *Scale prop. Try to use *Scale before using the accessor with updateTrigger for recalculation.
 - **MUST** avoid creating new arrays in the accessor fields. Use constant arrays that are defined outside of the layer.
 - Set `boxZoom`to false on MapLibre component to disable `Shift + Click` selection box.
 - Interleaved Binary Data's can be used to render poles to increase efficiency by doing every calculation on the GPU. (Cannot be used for buildings beacuse of their different shapes and varying point amounts.) (It can be used for lines if broken in to singular line segments before creating the lines.) (**MUST** find a way to bind the strings to the line, they cannot be sent to he ArrayBuffer [Can get them using the original list])
 - *Natively using the GPU currently does not work for creating column layers.*
 - Divide the lines before using in a layer, it causes **MAJOR** performance problems.