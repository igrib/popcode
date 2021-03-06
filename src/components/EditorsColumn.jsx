import {faChevronUp} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {DraggableCore} from 'react-draggable';
import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import prefixAll from 'inline-style-prefixer/static';
import {t} from 'i18next';
import classnames from 'classnames';
import clone from 'lodash-es/clone';
import isEmpty from 'lodash-es/isEmpty';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import partial from 'lodash-es/partial';
import partition from 'lodash-es/partition';

import {EditorLocation} from '../records';

import EditorContainer from './EditorContainer';
import Editor from './Editor';

export default function EditorsColumn({
  currentProject,
  errors,
  resizableFlexGrow,
  resizableFlexRefs,
  isFlexResizingSupported,
  isTextSizeLarge,
  requestedFocusedLine,
  onComponentHide,
  onComponentUnhide,
  onEditorInput,
  onRef,
  onRequestedLineFocused,
  onResizableFlexDividerDrag,
  style,
}) {
  const [hiddenLanguages, visibleLanguages] = partition(
    map(
      ['html', 'css', 'javascript'],
      (language, index) => ({language, index}),
    ),
    ({language}) => includes(
      currentProject.hiddenUIComponents,
      `editor.${language}`,
    ),
  );

  const children = [];

  visibleLanguages.forEach(({language, index}) => {
    children.push(
      <EditorContainer
        key={language}
        language={language}
        ref={resizableFlexRefs[index]}
        source={currentProject.sources[language]}
        style={{flexGrow: resizableFlexGrow.get(index)}}
        onHide={partial(
          onComponentHide,
          currentProject.projectKey,
          `editor.${language}`,
        )}
      >
        <Editor
          errors={errors[language].items}
          language={language}
          percentageOfHeight={1 / visibleLanguages.length}
          projectKey={currentProject.projectKey}
          requestedFocusedLine={requestedFocusedLine}
          source={currentProject.sources[language]}
          textSizeIsLarge={isTextSizeLarge}
          onInput={partial(
            onEditorInput,
            currentProject.projectKey,
            language,
          )}
          onRequestedLineFocused={onRequestedLineFocused}
        />
      </EditorContainer>,
    );
    if (index < visibleLanguages.length - 1) {
      children.push(
        <DraggableCore
          key={`divider:${language}`}
          onDrag={partial(onResizableFlexDividerDrag, index)}
        >
          <div
            className={classnames(
              'editors__row-divider',
              {'editors__row-divider_draggable': isFlexResizingSupported},
            )}
          />
        </DraggableCore>,
      );
    }
  });

  hiddenLanguages.forEach(({language}) => {
    children.push((
      <div
        className="editors__collapsed-editor"
        key={language}
        onClick={partial(
          onComponentUnhide,
          currentProject.projectKey,
          `editor.${language}`,
        )}
      >
        <div className="label editors__label editors__label_collapsed">
          {t(`languages.${language}`)}
          {' '}
          <FontAwesomeIcon icon={faChevronUp} />
        </div>
      </div>
    ));
  });

  if (isEmpty(children)) {
    return null;
  }

  return (
    <div
      className="environment__column"
      ref={onRef}
      style={prefixAll(clone(style))}
    >
      <div className="environment__column-contents editors">
        {children}
      </div>
    </div>
  );
}

EditorsColumn.propTypes = {
  currentProject: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  isFlexResizingSupported: PropTypes.bool.isRequired,
  isTextSizeLarge: PropTypes.bool.isRequired,
  requestedFocusedLine: PropTypes.instanceOf(EditorLocation),
  resizableFlexGrow: ImmutablePropTypes.list.isRequired,
  resizableFlexRefs: PropTypes.array.isRequired,
  style: PropTypes.object.isRequired,
  onComponentHide: PropTypes.func.isRequired,
  onComponentUnhide: PropTypes.func.isRequired,
  onEditorInput: PropTypes.func.isRequired,
  onRef: PropTypes.func.isRequired,
  onRequestedLineFocused: PropTypes.func.isRequired,
  onResizableFlexDividerDrag: PropTypes.func.isRequired,
};

EditorsColumn.defaultProps = {
  requestedFocusedLine: null,
};
