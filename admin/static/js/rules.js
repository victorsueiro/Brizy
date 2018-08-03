var h = hyperapp.h;

var RULE_TYPE_INCLUDE = '1';
var RULE_TYPE_EXCLUDE = '2';

var RULE_POSTS = '1';
var RULE_TAXONOMY = '2';
var RULE_ARCHIVE = '4';
var RULE_TEMPLATE = '8';


var defaultRule = {
    type: RULE_TYPE_INCLUDE,
    appliedFor: '',
    entityType: '',
    entityValues: []
};

var state = {
    rule: defaultRule,
    rules: Brizy_Admin_Rules.rules,
    errors: '',
    groups: []
};

var api = {
    getGroupList: function () {
        return jQuery.getJSON(Brizy_Admin_Rules.url, {
            action: 'brizy_rule_group_list',
            hash: Brizy_Admin_Rules.hash,
        });
    },
    getPosts: function (postType, filter, exclude) {
        return jQuery.getJSON(Brizy_Admin_Rules.url, {
            action: 'brizy_get_posts',
            excludePostTypes: exclude,
            postType: postType,
            filterTerm: filter,
            hash: Brizy_Admin_Rules.hash,
        })
    },
    getTerms: function (taxonomy) {
        return jQuery.getJSON(Brizy_Admin_Rules.url, {
            action: 'brizy_get_terms',
            hash: Brizy_Admin_Rules.hash,
            taxonomy: taxonomy,
        })
    },
    createRule: function (rule) {
        return jQuery.post(Brizy_Admin_Rules.url, {
            action: 'brizy_add_rule',
            rule: rule,
            hash: Brizy_Admin_Rules.hash,
            post: Brizy_Admin_Rules.id
        })
    },

    deleteRule: function (ruleId) {
        return jQuery.post(Brizy_Admin_Rules.url, {
            action: 'brizy_delete_rule',
            rule: ruleId,
            hash: Brizy_Admin_Rules.hash,
            post: Brizy_Admin_Rules.id
        })
    },

    getRuleList: function () {
        return jQuery.post(Brizy_Admin_Rules.url, {
            action: 'brizy_list_rules',
            hash: Brizy_Admin_Rules.hash,
            post: Brizy_Admin_Rules.id
        })
    }
};

var actions = {

    getState: function (value) {
        return function (state) {
            return state;
        }
    },

    updateGroups: function (value) {
        return function (state) {
            return {groups: value};
        }
    },

    rule: {
        setType: function (value) {
            return function (state) {
                return {type: value};
            }
        },
        setAppliedFor: function (value) {
            return function (state) {
                return {appliedFor: value};
            }
        },
        setEntityType: function (value) {
            return function (state) {
                return {entityType: value};
            }
        },
        setEntityValues: function (value) {
            return function (state) {
                return {entityValues: value};
            }
        },
    },
    resetRule: function () {
        return function (state) {
            return {errors: '', rule: defaultRule};
            //return deepmerge(state, {errors: '', rule: defaultRule}, {arrayMerge: arrayMerge});
        }
    },
    addFormErrors: function (errors) {
        return function (state) {
            return {errors: errors};
            //return deepmerge(state, {errors: errors}, {arrayMerge: arrayMerge});
        }
    },
    setRuleList: function (rules) {
        return function (state) {
            return {rules: rules};
            //var d = deepmerge(state, rules, {arrayMerge: arrayMerge});
            //return d;
        }
    },

};


var RuleTypeField = function (params) {
    return function (state, action) {
        return h("select", {
                disabled: params.disabled,
                onchange: function (e) {
                    action.rule.setType(e.target.value)
                }
            },
            [
                h(
                    "option",
                    {value: RULE_TYPE_INCLUDE, selected: params.value === RULE_TYPE_INCLUDE},
                    "Include"
                ),
                h(
                    "option",
                    {value: RULE_TYPE_EXCLUDE, selected: params.value === RULE_TYPE_EXCLUDE},
                    "Exclude"
                )
            ]);
    }
};

Select2 = function (params) {
    var oncreate = function (element) {
        var el = jQuery(element).select2().on('change', params.onChange);
        if (params.optionRequest) {
            params.optionRequest.done(function (data) {
                var options = params.convertResponseToOptions(data);
                options.forEach(function (option) {
                    el.append(option).trigger('change');
                });
            })
        }
    };

    var onremove = function (element, done) {
        jQuery(element).select2('destroy');
        done();
    };

    return h("select", {
        //key: params.id,
        style: params.style,
        disabled: params.disabled,
        oncreate: oncreate,
        onremove: onremove,
        onchange: params.onChange
    }, []);
};


var PostSelect2Field = function (params) {
    var convertResponseToOptions = function (data) {
        var options = [new Option("All", null, false, false)];
        data.posts.forEach(function (post) {
            var selected = params.value.includes(post.ID + "");
            options.push(new Option(post.title, post.ID, false, selected));
        });
        return options;
    };

    return h(Select2, {
        id: params.id,
        value: params.value,
        disabled: params.disabled,
        style: params.style ? params.style : {width: '200px'},
        optionRequest: params.optionRequest,
        convertResponseToOptions: convertResponseToOptions,
        onChange: params.onChange
    }, []);
};

var RuleCustomPostSearchField = function (params) {
    return h(PostSelect2Field, {
        id: params.id,
        disabled: params.disabled,
        value: params.rule.entityValues,
        optionRequest: api.getPosts(params.postType),
        onChange: params.onChange
    }, []);
};

var RuleTaxonomySearchField = function (params) {
    var convertResponseToOptions = function (data) {
        var options = [new Option("All", null, false, false)];
        data.forEach(function (term) {
            options.push(new Option(term.name, term.term_id, false, false));
        });
        return options;
    };

    return h(Select2, {
        id: 'taxonomies-' + params.taxonomy,
        style: params.style ? params.style : {width: '200px'},
        optionRequest: api.getTerms(params.taxonomy),
        convertResponseToOptions: convertResponseToOptions,
        onChange: params.onChange,
        disabled: params.disabled,
    }, []);
};


var RuleApplyGroupField = function (params) {
    return function (state, actions) {
        var appliedFor = params.rule.appliedFor;
        var entityType = params.rule.entityType;
        var value = appliedFor + '|' + entityType;
        var groups = [];


        params.groups.forEach(function (group) {
            var options = [];
            group.items.forEach(function (option) {
                var optionValue = group.value + '|' + option.value;
                var attributes = {value: optionValue, selected: optionValue === value};
                options.push(h("option", attributes, option.title));
            });
            const attributes = {label: group.title};

            if (group.value + '|' === '|') {
                groups.push(h("option", {value: '|'}, group.title));
            } else {
                groups.push(h("optgroup", attributes, options));
            }
        });

        const attributes = {
            onchange: function (e) {
                var values = e.target.value.split('|');
                actions.rule.setAppliedFor(values[0]);
                actions.rule.setEntityType(values[1]);
            }
        };

        if (params.disabled) {
            attributes.disabled = 'disabled';
        }

        var elements = [h("select", attributes, groups)];

        switch (appliedFor) {
            case RULE_POSTS:
                elements.push(
                    h(RuleCustomPostSearchField, {
                        id: appliedFor + value,
                        postType: entityType,
                        rule: params.rule,
                        disabled: params.disabled,
                        onChange: function (e) {
                            actions.rule.setEntityValues(e.target.value && e.target.value != "null" ? [e.target.value] : []);
                        }
                    })
                );
                break;
            case RULE_TAXONOMY:
                elements.push(
                    h(RuleTaxonomySearchField, {
                        id: appliedFor + value,
                        rule: params.rule,
                        taxonomy: entityType,
                        disabled: params.disabled,
                        onChange: function (e) {
                            actions.rule.setEntityValues(e.target.value && e.target.value != "null" ? [e.target.value] : []);
                        }
                    })
                );
                break;
        }

        return h('span', {}, elements);
    }
};


var RuleForm = function (params) {
    var elements = [
        h('h4', {}, 'Add New Condition'),
        h(RuleTypeField, {value: params.rule.type}),
        h(RuleApplyGroupField, {rule: params.rule, groups: params.groups}),
        h("input", {
            type: "button",
            class: "button",
            onclick: params.onSubmit,
            value: "Add"
        })
    ];

    if (params.errors) {
        elements.push(h('p', {class: 'error'}, params.errors));
    }

    return h('div', {}, elements)

};


var RuleListItem = function (params) {
    return h('div', {class: "rule"}, [
        h(RuleTypeField, {value: params.rule.type, disabled: true}),
        h(RuleApplyGroupField, {rule: params.rule, groups: params.groups, disabled: true}),
        h('input', {
            class: "brizy-delete-rule deletion",
            type: "button",
            value: "Delete",
            onclick: function (e) {
                params.onDelete(params.rule);
            }
        })
    ]);
};

var RuleList = function (params) {
    var elements = [];
    if (params.rules.length) {
        elements.push(h('h4', {}, 'Where do You Want to Display it'));
    }
    params.rules.forEach(function (rule) {
        elements.push(h(RuleListItem, {rule: rule, groups: params.groups, onDelete: params.onDelete}));
    });

    return h('div', {}, elements)
};


var view = function (state, actions) {
    return h("div", {
            oncreate: function () {
                api.getGroupList().done(actions.updateGroups);
            }
        },
        [
            h(RuleList, {
                rules: state.rules,
                groups: state.groups,
                onDelete: function (rule) {
                    api.deleteRule(rule.id).done(function () {
                        api.getRuleList().done(function (response) {
                            actions.setRuleList(response.data)
                        })
                    })
                }
            }),
            h(RuleForm, {
                rule: state.rule,
                onChange: actions.ruleChange,
                groups: state.groups,
                errors: state.errors,
                onSubmit: function () {
                    api.createRule(state.rule).done(function () {
                        api.getRuleList().done(function (response) {
                            actions.setRuleList(response.data);
                        });
                        actions.resetRule();
                    }).fail(function (response) {
                        if (response.responseJSON && response.responseJSON.data) {
                            if (response.responseJSON.data.message)
                                actions.addFormErrors(response.responseJSON.data.message);
                            else
                                actions.addFormErrors('Failed to add the rule');
                        }
                    })
                }
            })
        ]);
};

jQuery(document).ready(function ($) {
    hyperapp.app(state, actions, view, document.getElementById('rules'));
});
