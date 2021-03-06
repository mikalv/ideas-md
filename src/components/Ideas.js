/* global VERSION */
require('./Ideas.css')

var React = require('react')
var Octicon = require('react-octicon')
var {connect} = require('react-redux')
var {bindActionCreators} = require('redux')

var Button = require('./Button')
var Gist = require('./Gist')
var MarkdownArea = require('./MarkdownArea')
var Section = require('./Section')

var actions = require('../actions')
var {exportFile, storeState} = require('../utils')
var {createMarkdown} = require('../markdown')

var hasFileReader = 'FileReader' in window

var mapStateToProps = (state) => state
var mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

var Ideas = React.createClass({
  getInitialState() {
    return {
      showGist: !!this.props.gist
    }
  },
  componentDidMount() {
    if (hasFileReader) {
      document.addEventListener('dragover', this.handleDragOver)
      document.addEventListener('drop', this.handleDrop)
    }
    window.addEventListener('beforeunload', this.handleBeforeUnload)

    if (!this.props.gist && window.location.hash.length === 21) {
      this.props.editGist(window.location.hash.substring(1))
      if (!this.state.showGist) {
        this.setState({showGist: true})
      }
    }
  },
  componentWillUnmount() {
    if (hasFileReader) {
      document.removeEventListener('dragover', this.handleDragOver)
      document.removeEventListener('drop', this.handleDrop)
    }
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
  },

  handleAddSection(e) {
    this.props.addSection()
  },
  handleBeforeUnload(e) {
    var {general, sections, exportFormat, gist, token} = this.props
    storeState({general, sections, exportFormat, gist, token})
  },
  handleDragOver(e) {
    e.preventDefault()
  },
  handleDrop(e) {
    e.preventDefault()
    if (!e.dataTransfer.files || !e.dataTransfer.files[0]) {
      return
    }
    var reader = new window.FileReader()
    reader.onload = (e) => this.props.importMarkdown(e.target.result)
    reader.readAsText(e.dataTransfer.files[0])
  },
  handleEditGeneral(e) {
    this.props.editGeneral(e.target.value)
  },
  handleExport(e) {
    exportFile(createMarkdown(this.props), 'IDEAS.md')
  },
  handleToggleGist() {
    this.setState({showGist: !this.state.showGist})
  },

  render() {
    var {general, newSectionId, sections} = this.props
    var {showGist} = this.state
    return <div className="Ideas">
      <div className="Ideas__tools">
        <Button onClick={this.handleToggleGist} title="Gist integration" active={showGist}>
          <Octicon name="gist"/>
        </Button>
        <Button onClick={this.handleExport} title="Export to file">
          <Octicon name="cloud-download"/>
        </Button>
      </div>

      {this.state.showGist && <Gist {...this.props}/>}

      <div className="Ideas__buttons">
        <Button onClick={this.handleAddSection} title="Add section">
          <Octicon name="plus"/>
        </Button>
      </div>
      <div className="Ideas__general" key="general">
        <MarkdownArea
          name="general"
          value={general}
          onBlur={this.handleEditGeneral}
          placeholder="[general]"
        />
      </div>
      <div className="Ideas__sections" key="sections">
        {sections.map((section, i) =>
          <Section
            {...section}
            onEditSection={this.props.editSection}
            onRemoveSection={this.props.removeSection}
            isNew={section.id === newSectionId}
            key={section.id}
          />
        )}
      </div>
      <footer>
        <span>{`ideas-md v${VERSION}`}</span>
        {' | '}
        <a href="https://github.com/insin/ideas-md">
          <Octicon name="repo-forked"/> on <Octicon name="logo-github"/>
        </a>
      </footer>
    </div>
  }
})

module.exports = connect(mapStateToProps, mapDispatchToProps)(Ideas)
