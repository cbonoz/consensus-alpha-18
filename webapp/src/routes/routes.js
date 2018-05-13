export default [
    {
        path: '/start/home/:status',
        /*  Async WebPack code split  */
        getComponent: (nextState, cb) => {
            require.ensure([], require => {
                cb(null, require('./Studies').default);
            }, 'start-projects');
        }
    },
		{
        path: '/viewer/study-details/:status/:study_id',
        /*  Async WebPack code split  */
        getComponent: (nextState, cb) => {
            require.ensure([], require => {
                cb(null, require('./Viewer/StudyDetails').default);
            }, 'viewer-study-details');
        }
    },
    {
        path: '*',
        component: require('./Pages/NotFound').default
    }
];
