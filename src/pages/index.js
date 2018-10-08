import React from "react";
import { Link } from "gatsby";

const IndexPage = () => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta http-equiv="x-ua-compatible" content="ie=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <title data-react-helmet="true" />
      <script src="//unpkg.com/3d-force-graph@1" />
      <script src="//cdnjs.cloudflare.com/ajax/libs/qwest/4.4.5/qwest.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/97/three.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.1.4/papaparse.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js" />
      <link rel="shortcut icon" href="/icons/icon-48x48.png" />
      <meta name="theme-color" content="#663399" />
      <input type="file" id="csv-file" name="files" />
    </head>

    <body>
      <canvas id="meter" width="500" height="50" />
      <script src="../components/render.js" />
    </body>
  </html>
);

export default IndexPage;
