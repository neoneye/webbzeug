window.Webbzeug ?= {}
window.Webbzeug.Actions ?= {}
window.Webbzeug.Actions.Save = class SaveAction extends Webbzeug.Action
  type: 'save'
  availableParameters: ->
    {
      id: { name: 'ID', type: 'number', min: 0, max: 255, default: 0 }
    }

  render: (contexts) ->
    super()

    if contexts.length == 0
      console.log "A save action needs one input"
      return false

    @app.memory[@getParameter('id')] = contexts[0]
    
    return contexts[0]