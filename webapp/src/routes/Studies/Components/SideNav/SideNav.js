import React from 'react';
const _ = require('lodash');
import uid from 'node-uuid';
import classNames from 'classnames';
const querystring = require('querystring');
import { connect } from 'routes/routedComponent';

import {
    Nav,
    NavItem,
    Badge
} from 'components';

import {
  selectStudyList
} from '../../actions'

import classes from './SideNav.scss';

class SideNav extends React.Component {

	static propTypes = {
		items: React.PropTypes.array.isRequired,
    router: React.PropTypes.object,
    query: React.PropTypes.object
	}

	static defaultProps = {
		query: {
			"page_size" : 25,
			"page_offset" : 0,
			"status" : "all"
		}
	}

	constructor(props, context) {
			super(props, context);

			this.onClickNav = this.onClickNav.bind(this);
	}
	onClickNav (router, status, query) {
		const {dispatch, params} = this.props;
		if (!query["page_size"]) {
			query["page_size"] = 25
		}
		if (!query["page_offset"]) {
			query["page_offset"] = 0
		}
		query["status"] = status["label"]
		dispatch(selectStudyList(query["status"]))
		const query_params = querystring.stringify(query);
		router.push('/start/home/' + status["label"])
	}

	render() {
    const { items, className, router, query, params } = this.props;
    const otherProps = _.omit(this.props, 'items', 'className', 'router', "query", "dispatch", "received_at", "study_list_label", "selected_study_list", "study_lists", "didInvalidate", "study_list_loading", "did_invalidate", "params");

		const query_params = querystring.stringify(query)

    const inboxClass = classNames(classes.foldersList, className);

    return (
        <Nav
            stacked
            bsStyle="pills"
            className={ classes.foldersList }
            activeKey={ _.findIndex(items, s => s.label === params.status) }
            { ...otherProps }
        >
            {
                _.map(items, (folder, index) => (
                    <NavItem
                        key={ index }
                        className={ classes.flexSpaceBetween }
                        eventKey={ index }
                        onClick={ () => this.onClickNav(router, folder, query) }
                    >
                        <span>
                            {
                                folder.icon && (
                                    <span className={`m-r-1`}>
                                        { folder.icon }
                                    </span>
                                )
                            }
                            <span>{ folder.title }</span>
                        </span>
                        <Badge>{ folder.count }</Badge>
                    </NavItem>
                ))
            }
        </Nav>
    );
	};
}
const mapStateToProps = (state) => {
  return state.studies;
}

export default connect(
  mapStateToProps
)(SideNav)

// export default SideNav;
