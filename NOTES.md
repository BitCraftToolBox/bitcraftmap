## Things I found

- https://msgpack.org/
- https://geojson.org/
    - https://medium.com/@dmitry.sobolevsky/geojson-tutorial-for-beginners-ce810d3ff169
    - https://leafletjs.com/examples/geojson/
    - https://geojsonlint.com/
- https://h3geo.org/
- https://d3js.org/
    - https://d3-graph-gallery.com/graph/hexbinmap_geo_basic.html
    - https://www.visualcinnamon.com/2013/07/self-organizing-maps-creating-hexagonal/
    - https://www.visualcinnamon.com/2013/07/self-organizing-maps-adding-boundaries/
- https://p5js.org/
- https://docs.mapbox.com/mapbox-gl-js/api/
- https://github.com/mapbox/geobuf

move coordinate finder + coordinate a mouse cursor + coordinate and biome finder

## Wild ideas board

- Pathfinder using terrain elevation data
- Coordinates to biome calculator
- Rewrite to Typescript
- Query the database instead of getting data from bitjita
- Calculate walkable zones (ie where cart can go because there is no water)
- Do a community map instead of a spoiler map at launch
- "count" each filter
- Save setting via cookie or local storage ?
- Have a lexicon with resources screenshots
- show list of opened job on the map
- show dropped item on the map (lol)
- Optional : slice the map in 9
- chunk coord ?
- freeze coordinates information when clicking a waypoint

- User Intercae
  - Turn on / Turn off all waypoint
  - New interface that follow bitcraft style
  - Options that allow you to draw on the map

- Players data
  - Show player waystone
  - Show player missing waystones
  - calculate 'closest known waystone' to a location
  - Calculate player heat density zones
  - Show players on the map dynamically
  - See people exploration level in real time
  - Crazy idea : live map of all players, and text bubble above them that show what they say (lol)

- Market data
  - Show market data for each waypoints
  - Best prices for this market [1/5/10 percentile of prices]
  - Volume of the market calculated in number of orders, total buy order in hexcoins, other methods...

- Empires :
  - Show empire borders
  - Show watchtowers
  - More info about watchtowers (expiration / war...)
  - Show and search information related to empire (ex : search by empire name, number of tower)
  - Make capital of empire stand out
  - Watchtower optimization algorithm

- Misc :
  - Show region names
  - Show regions grid
  - Show chunks grid
  - bitcraft ingame time
  - traveler quest reset timer
  - user control of what icons are on top
  - legends
  - 3D scene to show resources as they are ingame

- Thoughs about a navigation algorithm
  - input starting position or "locate me" from name
  - input destination
  - Do you want to use waystones ?
  - How many energy do you have ?
  - what do you want to carry ? (% of inventory ?)
  - Does the user want to move cargo ?
  - Calculate zones where its better to move around water than deploying a boat
  - So we need list of deployable from the user
  - calculate total time

- Navigation "addon"
  - Find a way to display an overlaw over bitcraft to show an arrow when the user want to move to a destination

## Pass geoJson with the location.hash

- Possibles attacks : DOS (too many markers) / XSS / Unexpected behavior if malformed string
- https://www.text-utils.com/remove-extra-spaces/
- https://www.base64encode.org/




## Check later

- https://leafletjs.com/plugins.html#layer-switching-controls
- https://github.com/stefanocudini/leaflet-search/tree/master / https://opengeo.tech/maps/leaflet-search/
- https://worace.works/2022/02/23/kicking-the-tires-flatgeobuf/
- https://pasq.fr/flatgeobuf-soyons-binaire
- https://flatgeobuf.org/examples/leaflet/
- https://github.com/mapbox/geobuf


## List of possible filters
- Global filter
    - Filter by region
    - Filter by biome
- Claims
    - Filter by tier
    - Filter / Search by name

- Filter per profession
    - Foraging
    - Hunting
    - Mining
    - Forestry
    - Fishing

- Resources
    - Filter by tier

- Caves
    - Filter by tier
    - Filter by size

## Ui design
- Menu
    - Colapse
    - Move around
    - Pin to current position
    - Load settings
    - Save settings
    - Share settings

- Later
    - Resource Finder in range [circle or draw a shape]

## Some inspiration

- https://www.newworld-map.com/
- https://interactive-game-maps.github.io/
- https://stackoverflow.com/questions/12262163/what-are-leaflet-and-mapbox-and-what-are-their-differences
- (ablion map) view-source:https://albiononline2d.com/public/js/map.js https://albiononline2d.com/en/map/2202

- https://genshin-impact-map.appsample.com/?map=teyvat
- https://act.hoyolab.com/ys/app/interactive-map/index.html
- https://www.npmjs.com/package/@mapbox/geojsonhint

## Generic info

- Tiers
    - 1:'#A0A0A0'
    - 2:'#E8B57A'
    - 3:'#A0D2B2'
    - 4:'#3B60E4'
    - 5:'#9C4A93'
    - 6:'#B03A48'
    - 7:'#EEDD7A'
    - 8:'#4CA3A6'
    - 9:'#3A3A3A'
    - 10:'#BFD4E0'


## Bounding box

- https://gis.stackexchange.com/questions/76113/dynamically-set-zoom-level-based-on-a-bounding-box
- https://www.google.com/search?sca_esv=9707cd9f776f091f&sxsrf=AE3TifOcCRxiLnqzwKz9qNlkRxzYF-QYNQ:1754167009955&udm=2&fbs=AIIjpHx4nJjfGojPVHhEACUHPiMQ_pbg5bWizQs3A_kIenjtcpTTqBUdyVgzq0c3_k8z34EAuM72an33lMW6RWde9ePJpwNFtZw3UQvFloZy04_0a2t90M1pjb-hlKRN5_Y-eT7ZEcVhb6tlz5ZvzwJfgnPcI9sO9tdtG4H8zxL-DrxbEkQcUjNRbZ70noEbDq9g2_ndCyCt&q=what+is+a+bounding+box+geojson&sa=X&ved=2ahUKEwjj-ISs_eyOAxUjfKQEHU9SBbUQtKgLegQIDxAB&biw=2122&bih=1018&dpr=1.25#vhid=02OhC2ONeqVqQM&vssid=mosaic
- https://stackoverflow.com/questions/22948096/get-the-bounding-box-of-the-visible-leaflet-map