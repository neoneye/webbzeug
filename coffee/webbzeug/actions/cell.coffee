`var CustomRandom = function(nseed) {

    var seed,
        constant = Math.pow(2, 13)+1,
        prime = 37,
        maximum = Math.pow(2, 50);

    if (nseed) {
        seed = nseed;
    }

    if (seed == null) {
        seed = (new Date()).getTime();
    }

    return {
        next : function() {
            seed *= constant;
            seed += prime;
            seed %= maximum;

            return seed;
        },
        next01: function() {
          return this.next() / maximum;
        }
    }
}`

window.Webbzeug ?= {}
window.Webbzeug.Actions ?= {}
window.Webbzeug.Actions.Cell = class CellAction extends Webbzeug.Action
  type: 'cell'
  name: 'Cell'
  canvas: null
  availableParameters: ->
    {
      gridSize: { name: 'Grid size', type: 'integer', min: 2, max: 100, default: 8, scrollPrecision: 1 },
      seed: { name: 'Seed', type: 'integer', min: 0, max: 255, default: Math.round(Math.random() * 255), scrollPrecision: 1 },
      type: { name: 'Type', type: 'enum', values: { balls: 'Balls', mosaic: 'Mosaic' }, default: 'balls' }
    }

  validations: (contexts) ->
    warnings = []
    if contexts.length > 1
      warnings.push 'Cell will only use the first input.'

    return { warnings: warnings }

  render: (inputs) ->
    super()
    if not @canvas?
      @createCanvas()

    @createPatternOnCanvas()
    cellTexture = new THREE.Texture @canvas
    cellTexture.needsUpdate = true

    @cellMaterial = new THREE.MeshBasicMaterial map: cellTexture
    @screenAlignedQuadMesh.material = @cellMaterial
    @app.renderer.render @renderToTextureScene , @app.renderToTextureCamera, @renderTarget, true

    return @renderTarget

  createPatternOnCanvas:  ->
    imageData = @context.getImageData 0, 0, @app.getWidth(), @app.getHeight()

    gridSize = parseInt @getParameter('gridSize')

    points = @generatePoints gridSize

    gridPxSize = @app.getWidth() / gridSize

    w = @app.getWidth()
    h = @app.getHeight()

    maxDist = Math.sqrt(Math.pow(gridPxSize, 2) + Math.pow(gridPxSize, 2)) * 2

    for x in [0...w]
      for y in [0...h]

        gridPosX = Math.floor(x / gridPxSize)
        gridPosY = Math.floor(y / gridPxSize)

        distances = []

        minDist = maxDist

        for gridX in [(gridPosX - 1)..(gridPosX + 1)]
          originalGridX = gridX

          if gridX < 0            then gridX = gridSize + gridX
          if gridX > gridSize - 1 then gridX = gridX - gridSize

          for gridY in [(gridPosY - 1)..(gridPosY + 1)]
            # Overlap
            originalGridY = gridY

            # Overlapping
            if gridY < 0            then gridY = gridSize + gridY
            if gridY > gridSize - 1 then gridY = gridY - gridSize
            # / Overlapping

            point = points[gridX][gridY]

            px = point.x
            py = point.y

            # Fixing overlapped positions
            if originalGridX < 0                 then px -= w
            else if originalGridX > gridSize - 1 then px += w

            if originalGridY < 0                 then py -= h
            else if originalGridY > gridSize - 1 then py += h
            # / Fixing overlapped positions

            dist = Math.sqrt(Math.pow(x - px,2) + Math.pow(y - py,2))
            distances.push dist

            minDist = Math.min(minDist, dist)

        if @getParameter('type') is 'mosaic'
          distances.sort (a, b) =>
            if a > b
              return 1
            if a < b
              return -1
            return 0

          lastMinDist = distances[1]

          value = (lastMinDist - minDist) / maxDist * 255
        else if @getParameter('type') is 'balls'
          value = minDist / maxDist * 255

        index = ((y * w) << 2) + (x << 2)
        imageData.data[index] = value
        imageData.data[index + 1] = value
        imageData.data[index + 2] = value
        imageData.data[index + 3] = 255

    # for point in _.flatten(points)
    #   imageData.data[((point.y * 256) << 2) + (point.x << 2)] = 255
    #   imageData.data[((point.y * 256) << 2) + (point.x << 2) + 3] = 255


    @context.putImageData imageData, 0, 0
    return @context

  generatePoints: (gridSize) ->
    w = @app.getWidth()
    h = @app.getHeight()

    gridW = w / gridSize
    gridH = h / gridSize

    custRnd = CustomRandom(@getParameter('seed'))

    points = []
    for x in [0...gridSize]
      pointsCol = []
      for y in [0...gridSize]
        pointsCol.push { x: Math.ceil(x * gridW + custRnd.next01() * gridW), y: Math.ceil(y * gridH + custRnd.next01() * gridH) }

      points.push pointsCol

    return points
