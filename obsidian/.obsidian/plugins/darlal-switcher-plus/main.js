'use strict';

var obsidian = require('obsidian');
var electron = require('electron');

var PathDisplayFormat;
(function (PathDisplayFormat) {
    PathDisplayFormat[PathDisplayFormat["None"] = 0] = "None";
    PathDisplayFormat[PathDisplayFormat["Full"] = 1] = "Full";
    PathDisplayFormat[PathDisplayFormat["FolderOnly"] = 2] = "FolderOnly";
    PathDisplayFormat[PathDisplayFormat["FolderWithFilename"] = 3] = "FolderWithFilename";
    PathDisplayFormat[PathDisplayFormat["FolderPathFilenameOptional"] = 4] = "FolderPathFilenameOptional";
})(PathDisplayFormat || (PathDisplayFormat = {}));
var Mode;
(function (Mode) {
    Mode[Mode["Standard"] = 1] = "Standard";
    Mode[Mode["EditorList"] = 2] = "EditorList";
    Mode[Mode["SymbolList"] = 4] = "SymbolList";
    Mode[Mode["WorkspaceList"] = 8] = "WorkspaceList";
    Mode[Mode["HeadingsList"] = 16] = "HeadingsList";
    Mode[Mode["BookmarksList"] = 32] = "BookmarksList";
    Mode[Mode["CommandList"] = 64] = "CommandList";
    Mode[Mode["RelatedItemsList"] = 128] = "RelatedItemsList";
    Mode[Mode["VaultList"] = 256] = "VaultList";
})(Mode || (Mode = {}));
var SymbolType;
(function (SymbolType) {
    SymbolType[SymbolType["Link"] = 1] = "Link";
    SymbolType[SymbolType["Embed"] = 2] = "Embed";
    SymbolType[SymbolType["Tag"] = 4] = "Tag";
    SymbolType[SymbolType["Heading"] = 8] = "Heading";
    SymbolType[SymbolType["Callout"] = 16] = "Callout";
    SymbolType[SymbolType["CanvasNode"] = 32] = "CanvasNode";
})(SymbolType || (SymbolType = {}));
var LinkType;
(function (LinkType) {
    LinkType[LinkType["None"] = 0] = "None";
    LinkType[LinkType["Normal"] = 1] = "Normal";
    LinkType[LinkType["Heading"] = 2] = "Heading";
    LinkType[LinkType["Block"] = 4] = "Block";
})(LinkType || (LinkType = {}));
const SymbolIndicators = {};
SymbolIndicators[SymbolType.Link] = '🔗';
SymbolIndicators[SymbolType.Embed] = '!';
SymbolIndicators[SymbolType.Tag] = '#';
SymbolIndicators[SymbolType.Heading] = 'H';
const HeadingIndicators = {};
HeadingIndicators[1] = 'H₁';
HeadingIndicators[2] = 'H₂';
HeadingIndicators[3] = 'H₃';
HeadingIndicators[4] = 'H₄';
HeadingIndicators[5] = 'H₅';
HeadingIndicators[6] = 'H₆';
var SuggestionType;
(function (SuggestionType) {
    SuggestionType["EditorList"] = "editorList";
    SuggestionType["SymbolList"] = "symbolList";
    SuggestionType["WorkspaceList"] = "workspaceList";
    SuggestionType["HeadingsList"] = "headingsList";
    SuggestionType["Bookmark"] = "bookmark";
    SuggestionType["CommandList"] = "commandList";
    SuggestionType["RelatedItemsList"] = "relatedItemsList";
    SuggestionType["VaultList"] = "vaultList";
    SuggestionType["File"] = "file";
    SuggestionType["Alias"] = "alias";
    SuggestionType["Unresolved"] = "unresolved";
})(SuggestionType || (SuggestionType = {}));
var MatchType;
(function (MatchType) {
    MatchType[MatchType["None"] = 0] = "None";
    MatchType[MatchType["Primary"] = 1] = "Primary";
    MatchType[MatchType["Basename"] = 2] = "Basename";
    MatchType[MatchType["Path"] = 3] = "Path";
})(MatchType || (MatchType = {}));
var RelationType;
(function (RelationType) {
    RelationType["DiskLocation"] = "disk-location";
    RelationType["Backlink"] = "backlink";
    RelationType["OutgoingLink"] = "outgoing-link";
})(RelationType || (RelationType = {}));

function isOfType(obj, discriminator, val) {
    let ret = false;
    if (obj && obj[discriminator] !== undefined) {
        ret = true;
        if (val !== undefined && val !== obj[discriminator]) {
            ret = false;
        }
    }
    return ret;
}
function isSymbolSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.SymbolList);
}
function isEditorSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.EditorList);
}
function isHeadingSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.HeadingsList);
}
function isFileSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.File);
}
function isAliasSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.Alias);
}
function isUnresolvedSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.Unresolved);
}
function isSystemSuggestion(obj) {
    return isFileSuggestion(obj) || isUnresolvedSuggestion(obj) || isAliasSuggestion(obj);
}
function isExSuggestion(sugg) {
    return sugg && !isSystemSuggestion(sugg);
}
function isHeadingCache(obj) {
    return isOfType(obj, 'level');
}
function isTagCache(obj) {
    return isOfType(obj, 'tag');
}
function isCalloutCache(obj) {
    return isOfType(obj, 'type', 'callout');
}
function isTFile(obj) {
    return isOfType(obj, 'extension');
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getInternalPluginById(app, id) {
    return app?.internalPlugins?.getPluginById(id);
}
function getInternalEnabledPluginById(app, id) {
    return app?.internalPlugins?.getEnabledPluginById(id);
}
function getSystemSwitcherInstance(app) {
    const plugin = getInternalPluginById(app, 'switcher');
    return plugin?.instance;
}
/**
 * @returns Array The string names for all the available Modes.
 */
function getModeNames() {
    return Object.values(Mode)
        .filter((v) => isNaN(Number(v)))
        .sort();
}
function stripMDExtensionFromPath(file) {
    let retVal = null;
    if (file) {
        const { path } = file;
        retVal = path;
        if (file.extension === 'md') {
            const index = path.lastIndexOf('.');
            if (index !== -1 && index !== path.length - 1 && index !== 0) {
                retVal = path.slice(0, index);
            }
        }
    }
    return retVal;
}
function filenameFromPath(path) {
    let retVal = null;
    if (path) {
        const index = path.lastIndexOf('/');
        retVal = index === -1 ? path : path.slice(index + 1);
    }
    return retVal;
}
function matcherFnForRegExList(regExStrings) {
    regExStrings = regExStrings ?? [];
    const regExList = [];
    for (const str of regExStrings) {
        try {
            const rx = new RegExp(str);
            regExList.push(rx);
        }
        catch (err) {
            console.log(`Switcher++: error creating RegExp from string: ${str}`, err);
        }
    }
    const isMatchFn = (input) => {
        for (const rx of regExList) {
            if (rx.test(input)) {
                return true;
            }
        }
        return false;
    };
    return isMatchFn;
}
function getLinkType(linkCache) {
    let type = LinkType.None;
    if (linkCache) {
        // remove the display text before trying to parse the link target
        const linkStr = linkCache.link.split('|')[0];
        if (linkStr.includes('#^')) {
            type = LinkType.Block;
        }
        else if (linkStr.includes('#')) {
            type = LinkType.Heading;
        }
        else {
            type = LinkType.Normal;
        }
    }
    return type;
}
/**
 * Retrieves a TFile object using path. Return null if path does not represent
 * a TFile object.
 * @param  {string} path
 * @param  {Vault} vault
 * @returns TFile
 */
function getTFileByPath(path, vault) {
    let file = null;
    const abstractItem = vault.getAbstractFileByPath(path);
    if (isTFile(abstractItem)) {
        file = abstractItem;
    }
    return file;
}
function generateMarkdownLink(fileManager, vault, sugg, sourcePath, options) {
    let linkStr = null;
    options = Object.assign({ useBasenameAsAlias: true, useHeadingAsAlias: true }, options);
    if (sugg) {
        let destFile = null;
        let alias = null;
        let subpath = null;
        const fileSuggTypes = [
            SuggestionType.Alias,
            SuggestionType.Bookmark,
            SuggestionType.HeadingsList,
            SuggestionType.SymbolList,
            SuggestionType.RelatedItemsList,
            SuggestionType.EditorList,
            SuggestionType.File,
        ];
        // for file based suggestions, get the destination file
        if (fileSuggTypes.includes(sugg.type)) {
            destFile = sugg.file;
        }
        const linkSubPathForHeading = (heading) => {
            return {
                subpath: `#${heading}`,
                alias: options.useHeadingAsAlias ? heading : null,
            };
        };
        switch (sugg.type) {
            case SuggestionType.Unresolved:
                linkStr = generateMarkdownLinkForUnresolved(sugg.linktext);
                break;
            case SuggestionType.Alias:
                alias = sugg.alias;
                break;
            case SuggestionType.Bookmark: {
                const { item } = sugg;
                if (item.type === 'file' && item.title) {
                    alias = item.title;
                }
                break;
            }
            case SuggestionType.HeadingsList: {
                const { heading } = sugg.item;
                ({ subpath, alias } = linkSubPathForHeading(heading));
                break;
            }
            case SuggestionType.SymbolList: {
                const { item: { symbol }, } = sugg;
                if (isHeadingCache(symbol)) {
                    ({ subpath, alias } = linkSubPathForHeading(symbol.heading));
                }
                else if (isOfType(symbol, 'link')) {
                    // Test if the link matches the external link format [text](url)
                    const isExternalLink = new RegExp(/^\[(.*?)\]\((.+?)\)/).test(symbol.original);
                    if (isExternalLink) {
                        linkStr = symbol.original;
                    }
                    else {
                        linkStr = generateMarkdownLinkForReferenceCache(fileManager, vault, sourcePath, symbol, destFile, options.useBasenameAsAlias);
                    }
                }
                else {
                    // Disable link generation for other symbol types by setting destFile to null
                    destFile = null;
                }
                break;
            }
            case SuggestionType.RelatedItemsList: {
                const { item } = sugg;
                if (item.unresolvedText) {
                    linkStr = generateMarkdownLinkForUnresolved(item.unresolvedText);
                }
                break;
            }
        }
        if (destFile && !linkStr) {
            // if an alias has be not identified use the filename as alias
            if (!alias && options.useBasenameAsAlias) {
                alias = destFile.basename;
            }
            linkStr = fileManager.generateMarkdownLink(destFile, sourcePath, subpath, alias);
        }
    }
    return linkStr;
}
function generateMarkdownLinkForUnresolved(path, displayText) {
    displayText = displayText?.length ? `|${displayText}` : '';
    return `[[${path}${displayText}]]`;
}
function generateMarkdownLinkForReferenceCache(fileManager, vault, sourcePath, refCache, refCacheSourceFile, useBasenameAsAlias) {
    const { link, displayText } = refCache;
    const { path, subpath } = obsidian.parseLinktext(link);
    let alias = displayText;
    let destFile = null;
    let linkStr = null;
    if (!path?.length) {
        // the path portion of the link is empty, meaning the destination path
        // is the file that contains the ReferenceCache
        destFile = refCacheSourceFile;
    }
    else {
        destFile = getTFileByPath(path, vault);
    }
    if (destFile) {
        if (!alias?.length && useBasenameAsAlias) {
            alias = destFile.basename;
        }
        linkStr = fileManager.generateMarkdownLink(destFile, sourcePath, subpath, alias);
    }
    else {
        linkStr = generateMarkdownLinkForUnresolved(path, alias);
    }
    return linkStr;
}

class FrontMatterParser {
    static getAliases(frontMatter) {
        let aliases = [];
        if (frontMatter) {
            aliases = FrontMatterParser.getValueForKey(frontMatter, /^alias(es)?$/i);
        }
        return aliases;
    }
    static getValueForKey(frontMatter, keyPattern) {
        const retVal = [];
        const fmKeys = Object.keys(frontMatter);
        const key = fmKeys.find((val) => keyPattern.test(val));
        if (key) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            let value = frontMatter[key];
            if (typeof value === 'string') {
                value = value.split(',');
            }
            if (Array.isArray(value)) {
                value.forEach((val) => {
                    if (typeof val === 'string') {
                        retVal.push(val.trim());
                    }
                });
            }
        }
        return retVal;
    }
}

// map Canvas node data types to facet id
const CANVAS_NODE_FACET_ID_MAP = {
    file: 'canvas-node-file',
    text: 'canvas-node-text',
    link: 'canvas-node-link',
    group: 'canvas-node-group',
};
const SYMBOL_MODE_FACETS = [
    {
        id: SymbolType[SymbolType.Heading],
        mode: Mode.SymbolList,
        label: 'headings',
        isActive: false,
        isAvailable: true,
    },
    {
        id: SymbolType[SymbolType.Tag],
        mode: Mode.SymbolList,
        label: 'tags',
        isActive: false,
        isAvailable: true,
    },
    {
        id: SymbolType[SymbolType.Callout],
        mode: Mode.SymbolList,
        label: 'callouts',
        isActive: false,
        isAvailable: true,
    },
    {
        id: SymbolType[SymbolType.Link],
        mode: Mode.SymbolList,
        label: 'links',
        isActive: false,
        isAvailable: true,
    },
    {
        id: SymbolType[SymbolType.Embed],
        mode: Mode.SymbolList,
        label: 'embeds',
        isActive: false,
        isAvailable: true,
    },
    {
        id: CANVAS_NODE_FACET_ID_MAP.file,
        mode: Mode.SymbolList,
        label: 'file cards',
        isActive: false,
        isAvailable: true,
    },
    {
        id: CANVAS_NODE_FACET_ID_MAP.text,
        mode: Mode.SymbolList,
        label: 'text cards',
        isActive: false,
        isAvailable: true,
    },
    {
        id: CANVAS_NODE_FACET_ID_MAP.link,
        mode: Mode.SymbolList,
        label: 'link cards',
        isActive: false,
        isAvailable: true,
    },
    {
        id: CANVAS_NODE_FACET_ID_MAP.group,
        mode: Mode.SymbolList,
        label: 'groups',
        isActive: false,
        isAvailable: true,
    },
];
const RELATED_ITEMS_MODE_FACETS = [
    {
        id: RelationType.Backlink,
        mode: Mode.RelatedItemsList,
        label: 'backlinks',
        isActive: false,
        isAvailable: true,
    },
    {
        id: RelationType.OutgoingLink,
        mode: Mode.RelatedItemsList,
        label: 'outgoing links',
        isActive: false,
        isAvailable: true,
    },
    {
        id: RelationType.DiskLocation,
        mode: Mode.RelatedItemsList,
        label: 'disk location',
        isActive: false,
        isAvailable: true,
    },
];
const BOOKMARKS_FACET_ID_MAP = {
    file: 'bookmarks-file',
    folder: 'bookmarks-folder',
    search: 'bookmarks-search',
    group: 'bookmarks-group',
};
const BOOKMARKS_MODE_FACETS = [
    {
        id: BOOKMARKS_FACET_ID_MAP.file,
        mode: Mode.BookmarksList,
        label: 'files',
        isActive: false,
        isAvailable: true,
    },
    {
        id: BOOKMARKS_FACET_ID_MAP.folder,
        mode: Mode.BookmarksList,
        label: 'folders',
        isActive: false,
        isAvailable: true,
    },
    {
        id: BOOKMARKS_FACET_ID_MAP.search,
        mode: Mode.BookmarksList,
        label: 'searches',
        isActive: false,
        isAvailable: true,
    },
];
var CommandListFacetIds;
(function (CommandListFacetIds) {
    CommandListFacetIds["Pinned"] = "pinnedCommands";
    CommandListFacetIds["Recent"] = "recentCommands";
})(CommandListFacetIds || (CommandListFacetIds = {}));
const COMMAND_MODE_FACETS = [
    {
        id: CommandListFacetIds.Pinned,
        mode: Mode.CommandList,
        label: 'pinned',
        isActive: false,
        isAvailable: true,
    },
    {
        id: CommandListFacetIds.Recent,
        mode: Mode.CommandList,
        label: 'recent',
        isActive: false,
        isAvailable: true,
    },
];
var HeadingsListFacetIds;
(function (HeadingsListFacetIds) {
    HeadingsListFacetIds["RecentFiles"] = "recentFilesSearch";
    HeadingsListFacetIds["Bookmarks"] = "bookmarksSearch";
    HeadingsListFacetIds["Filenames"] = "filenamesSearch";
    HeadingsListFacetIds["Headings"] = "headingsSearch";
    HeadingsListFacetIds["ExternalFiles"] = "externalFilesSearch";
})(HeadingsListFacetIds || (HeadingsListFacetIds = {}));
const HEADINGS_MODE_FACETS = [
    {
        id: HeadingsListFacetIds.RecentFiles,
        mode: Mode.HeadingsList,
        label: 'recent files',
        isActive: false,
        isAvailable: true,
    },
    {
        id: HeadingsListFacetIds.Bookmarks,
        mode: Mode.HeadingsList,
        label: 'bookmarks',
        isActive: false,
        isAvailable: true,
    },
    {
        id: HeadingsListFacetIds.Filenames,
        mode: Mode.HeadingsList,
        label: 'filenames',
        isActive: false,
        isAvailable: true,
    },
    {
        id: HeadingsListFacetIds.Headings,
        mode: Mode.HeadingsList,
        label: 'headings',
        isActive: false,
        isAvailable: true,
    },
    {
        id: HeadingsListFacetIds.ExternalFiles,
        mode: Mode.HeadingsList,
        label: 'external files',
        isActive: false,
        isAvailable: true,
    },
];
function getFacetMap() {
    const facetMap = {};
    const facetLists = [
        SYMBOL_MODE_FACETS,
        RELATED_ITEMS_MODE_FACETS,
        BOOKMARKS_MODE_FACETS,
        COMMAND_MODE_FACETS,
        HEADINGS_MODE_FACETS,
    ];
    facetLists.flat().reduce((facetMap, facet) => {
        facetMap[facet.id] = Object.assign({}, facet);
        return facetMap;
    }, facetMap);
    return facetMap;
}

// istanbul ignore next
const isObject = (obj) => {
    if (typeof obj === "object" && obj !== null) {
        if (typeof Object.getPrototypeOf === "function") {
            const prototype = Object.getPrototypeOf(obj);
            return prototype === Object.prototype || prototype === null;
        }
        return Object.prototype.toString.call(obj) === "[object Object]";
    }
    return false;
};
const merge = (...objects) => objects.reduce((result, current) => {
    if (Array.isArray(current)) {
        throw new TypeError("Arguments provided to ts-deepmerge must be objects, not arrays.");
    }
    Object.keys(current).forEach((key) => {
        if (["__proto__", "constructor", "prototype"].includes(key)) {
            return;
        }
        if (Array.isArray(result[key]) && Array.isArray(current[key])) {
            result[key] = merge.options.mergeArrays
                ? merge.options.uniqueArrayItems
                    ? Array.from(new Set(result[key].concat(current[key])))
                    : [...result[key], ...current[key]]
                : current[key];
        }
        else if (isObject(result[key]) && isObject(current[key])) {
            result[key] = merge(result[key], current[key]);
        }
        else {
            result[key] =
                current[key] === undefined
                    ? merge.options.allowUndefinedOverrides
                        ? current[key]
                        : result[key]
                    : current[key];
        }
    });
    return result;
}, {});
const defaultOptions = {
    allowUndefinedOverrides: true,
    mergeArrays: true,
    uniqueArrayItems: true,
};
merge.options = defaultOptions;
merge.withOptions = (options, ...objects) => {
    merge.options = Object.assign(Object.assign({}, defaultOptions), options);
    const result = merge(...objects);
    merge.options = defaultOptions;
    return result;
};

class SwitcherPlusSettings {
    static get defaults() {
        const enabledSymbolTypes = {};
        enabledSymbolTypes[SymbolType.Link] = true;
        enabledSymbolTypes[SymbolType.Embed] = true;
        enabledSymbolTypes[SymbolType.Tag] = true;
        enabledSymbolTypes[SymbolType.Heading] = true;
        enabledSymbolTypes[SymbolType.Callout] = true;
        return {
            version: '2.0.0',
            onOpenPreferNewTab: true,
            alwaysNewTabForSymbols: false,
            useActiveTabForSymbolsOnMobile: false,
            symbolsInLineOrder: true,
            editorListCommand: 'edt ',
            symbolListCommand: '@',
            symbolListActiveEditorCommand: '$ ',
            workspaceListCommand: '+',
            headingsListCommand: '#',
            bookmarksListCommand: "'",
            commandListCommand: '>',
            vaultListCommand: 'vault ',
            relatedItemsListCommand: '~',
            relatedItemsListActiveEditorCommand: '^ ',
            shouldSearchHeadings: true,
            strictHeadingsOnly: false,
            searchAllHeadings: true,
            headingsSearchDebounceMilli: 250,
            excludeViewTypes: ['empty'],
            referenceViews: ['backlink', 'localgraph', 'outgoing-link', 'outline'],
            limit: 50,
            includeSidePanelViewTypes: ['backlink', 'image', 'markdown', 'pdf'],
            enabledSymbolTypes,
            selectNearestHeading: true,
            excludeFolders: [],
            excludeLinkSubTypes: 0,
            excludeRelatedFolders: [''],
            excludeOpenRelatedFiles: false,
            excludeObsidianIgnoredFiles: false,
            shouldSearchFilenames: false,
            shouldSearchBookmarks: false,
            shouldSearchRecentFiles: true,
            pathDisplayFormat: PathDisplayFormat.FolderWithFilename,
            hidePathIfRoot: true,
            enabledRelatedItems: Object.values(RelationType),
            showOptionalIndicatorIcons: true,
            overrideStandardModeBehaviors: true,
            enabledRibbonCommands: [
                Mode[Mode.HeadingsList],
                Mode[Mode.SymbolList],
            ],
            fileExtAllowList: ['canvas'],
            matchPriorityAdjustments: {
                isEnabled: false,
                adjustments: {
                    isOpenInEditor: { value: 0, label: 'Open items' },
                    isBookmarked: { value: 0, label: 'Bookmarked items' },
                    isRecent: { value: 0, label: 'Recent items' },
                    isAttachment: { value: 0, label: 'Attachment file types' },
                    file: { value: 0, label: 'Filenames' },
                    alias: { value: 0, label: 'Aliases' },
                    unresolved: { value: 0, label: 'Unresolved filenames' },
                    h1: { value: 0, label: 'H₁ headings' },
                },
                fileExtAdjustments: {
                    canvas: { value: 0, label: 'Canvas files' },
                },
            },
            quickFilters: {
                resetKey: '0',
                keyList: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
                modifiers: ['Ctrl', 'Alt'],
                facetList: getFacetMap(),
                shouldResetActiveFacets: false,
                shouldShowFacetInstructions: true,
            },
            preserveCommandPaletteLastInput: false,
            preserveQuickSwitcherLastInput: false,
            shouldCloseModalOnBackspace: false,
            maxRecentFileSuggestionsOnInit: 25,
            orderEditorListByAccessTime: true,
            insertLinkInEditor: {
                isEnabled: true,
                keymap: {
                    modifiers: ['Mod'],
                    key: 'i',
                    purpose: 'insert in editor',
                },
                insertableEditorTypes: ['markdown'],
                useBasenameAsAlias: true,
                useHeadingAsAlias: true,
            },
            removeDefaultTabBinding: true,
            navigationKeys: {
                nextKeys: [
                    { modifiers: ['Ctrl'], key: 'n' },
                    { modifiers: ['Ctrl'], key: 'j' },
                ],
                prevKeys: [
                    { modifiers: ['Ctrl'], key: 'p' },
                    { modifiers: ['Ctrl'], key: 'k' },
                ],
            },
            preferredSourceForTitle: 'H1',
            closeWhenEmptyKeys: [{ modifiers: null, key: 'Backspace' }],
            escapeCmdChar: '!',
            mobileLauncher: {
                isEnabled: false,
                modeString: Mode[Mode.HeadingsList],
                iconName: '',
                coreLauncherButtonIconSelector: 'span.clickable-icon',
                coreLauncherButtonSelector: '.mobile-navbar-action.mod-tappable:has(span.clickable-icon svg.svg-icon.lucide-plus-circle)',
            },
        };
    }
    get version() {
        return this.data.version;
    }
    set version(value) {
        this.data.version = value;
    }
    get builtInSystemOptions() {
        return getSystemSwitcherInstance(this.plugin.app)?.options;
    }
    get showAllFileTypes() {
        // forward to core switcher settings
        return this.builtInSystemOptions?.showAllFileTypes;
    }
    get showAttachments() {
        // forward to core switcher settings
        return this.builtInSystemOptions?.showAttachments;
    }
    get showExistingOnly() {
        // forward to core switcher settings
        return this.builtInSystemOptions?.showExistingOnly;
    }
    get onOpenPreferNewTab() {
        return this.data.onOpenPreferNewTab;
    }
    set onOpenPreferNewTab(value) {
        this.data.onOpenPreferNewTab = value;
    }
    get alwaysNewTabForSymbols() {
        return this.data.alwaysNewTabForSymbols;
    }
    set alwaysNewTabForSymbols(value) {
        this.data.alwaysNewTabForSymbols = value;
    }
    get useActiveTabForSymbolsOnMobile() {
        return this.data.useActiveTabForSymbolsOnMobile;
    }
    set useActiveTabForSymbolsOnMobile(value) {
        this.data.useActiveTabForSymbolsOnMobile = value;
    }
    get symbolsInLineOrder() {
        return this.data.symbolsInLineOrder;
    }
    set symbolsInLineOrder(value) {
        this.data.symbolsInLineOrder = value;
    }
    get editorListPlaceholderText() {
        return SwitcherPlusSettings.defaults.editorListCommand;
    }
    get editorListCommand() {
        return this.data.editorListCommand;
    }
    set editorListCommand(value) {
        this.data.editorListCommand = value;
    }
    get symbolListPlaceholderText() {
        return SwitcherPlusSettings.defaults.symbolListCommand;
    }
    get symbolListCommand() {
        return this.data.symbolListCommand;
    }
    set symbolListCommand(value) {
        this.data.symbolListCommand = value;
    }
    get symbolListActiveEditorCommand() {
        return this.data.symbolListActiveEditorCommand;
    }
    set symbolListActiveEditorCommand(value) {
        this.data.symbolListActiveEditorCommand = value;
    }
    get workspaceListCommand() {
        return this.data.workspaceListCommand;
    }
    set workspaceListCommand(value) {
        this.data.workspaceListCommand = value;
    }
    get workspaceListPlaceholderText() {
        return SwitcherPlusSettings.defaults.workspaceListCommand;
    }
    get headingsListCommand() {
        return this.data.headingsListCommand;
    }
    set headingsListCommand(value) {
        this.data.headingsListCommand = value;
    }
    get headingsListPlaceholderText() {
        return SwitcherPlusSettings.defaults.headingsListCommand;
    }
    get bookmarksListCommand() {
        return this.data.bookmarksListCommand;
    }
    set bookmarksListCommand(value) {
        this.data.bookmarksListCommand = value;
    }
    get bookmarksListPlaceholderText() {
        return SwitcherPlusSettings.defaults.bookmarksListCommand;
    }
    get commandListCommand() {
        return this.data.commandListCommand;
    }
    set commandListCommand(value) {
        this.data.commandListCommand = value;
    }
    get commandListPlaceholderText() {
        return SwitcherPlusSettings.defaults.commandListCommand;
    }
    get vaultListCommand() {
        return this.data.vaultListCommand;
    }
    set vaultListCommand(value) {
        this.data.vaultListCommand = value;
    }
    get vaultListPlaceholderText() {
        return SwitcherPlusSettings.defaults.vaultListCommand;
    }
    get relatedItemsListCommand() {
        return this.data.relatedItemsListCommand;
    }
    set relatedItemsListCommand(value) {
        this.data.relatedItemsListCommand = value;
    }
    get relatedItemsListPlaceholderText() {
        return SwitcherPlusSettings.defaults.relatedItemsListCommand;
    }
    get relatedItemsListActiveEditorCommand() {
        return this.data.relatedItemsListActiveEditorCommand;
    }
    set relatedItemsListActiveEditorCommand(value) {
        this.data.relatedItemsListActiveEditorCommand = value;
    }
    get shouldSearchHeadings() {
        return this.data.shouldSearchHeadings;
    }
    set shouldSearchHeadings(value) {
        this.data.shouldSearchHeadings = value;
    }
    get strictHeadingsOnly() {
        return this.data.strictHeadingsOnly;
    }
    set strictHeadingsOnly(value) {
        this.data.strictHeadingsOnly = value;
    }
    get searchAllHeadings() {
        return this.data.searchAllHeadings;
    }
    set searchAllHeadings(value) {
        this.data.searchAllHeadings = value;
    }
    get headingsSearchDebounceMilli() {
        return this.data.headingsSearchDebounceMilli;
    }
    set headingsSearchDebounceMilli(value) {
        this.data.headingsSearchDebounceMilli = value;
    }
    get excludeViewTypes() {
        return this.data.excludeViewTypes;
    }
    set excludeViewTypes(value) {
        this.data.excludeViewTypes = value;
    }
    get referenceViews() {
        return this.data.referenceViews;
    }
    set referenceViews(value) {
        this.data.referenceViews = value;
    }
    get limit() {
        return this.data.limit;
    }
    set limit(value) {
        this.data.limit = value;
    }
    get includeSidePanelViewTypes() {
        return this.data.includeSidePanelViewTypes;
    }
    set includeSidePanelViewTypes(value) {
        // remove any duplicates before storing
        this.data.includeSidePanelViewTypes = [...new Set(value)];
    }
    get includeSidePanelViewTypesPlaceholder() {
        return SwitcherPlusSettings.defaults.includeSidePanelViewTypes.join('\n');
    }
    get selectNearestHeading() {
        return this.data.selectNearestHeading;
    }
    set selectNearestHeading(value) {
        this.data.selectNearestHeading = value;
    }
    get excludeFolders() {
        return this.data.excludeFolders;
    }
    set excludeFolders(value) {
        // remove any duplicates before storing
        this.data.excludeFolders = [...new Set(value)];
    }
    get excludeLinkSubTypes() {
        return this.data.excludeLinkSubTypes;
    }
    set excludeLinkSubTypes(value) {
        this.data.excludeLinkSubTypes = value;
    }
    get excludeRelatedFolders() {
        return this.data.excludeRelatedFolders;
    }
    set excludeRelatedFolders(value) {
        this.data.excludeRelatedFolders = [...new Set(value)];
    }
    get excludeOpenRelatedFiles() {
        return this.data.excludeOpenRelatedFiles;
    }
    set excludeOpenRelatedFiles(value) {
        this.data.excludeOpenRelatedFiles = value;
    }
    get excludeObsidianIgnoredFiles() {
        return this.data.excludeObsidianIgnoredFiles;
    }
    set excludeObsidianIgnoredFiles(value) {
        this.data.excludeObsidianIgnoredFiles = value;
    }
    get shouldSearchFilenames() {
        return this.data.shouldSearchFilenames;
    }
    set shouldSearchFilenames(value) {
        this.data.shouldSearchFilenames = value;
    }
    get shouldSearchBookmarks() {
        return this.data.shouldSearchBookmarks;
    }
    set shouldSearchBookmarks(value) {
        this.data.shouldSearchBookmarks = value;
    }
    get shouldSearchRecentFiles() {
        return this.data.shouldSearchRecentFiles;
    }
    set shouldSearchRecentFiles(value) {
        this.data.shouldSearchRecentFiles = value;
    }
    get pathDisplayFormat() {
        return this.data.pathDisplayFormat;
    }
    set pathDisplayFormat(value) {
        this.data.pathDisplayFormat = value;
    }
    get hidePathIfRoot() {
        return this.data.hidePathIfRoot;
    }
    set hidePathIfRoot(value) {
        this.data.hidePathIfRoot = value;
    }
    get enabledRelatedItems() {
        return this.data.enabledRelatedItems;
    }
    set enabledRelatedItems(value) {
        this.data.enabledRelatedItems = value;
    }
    get showOptionalIndicatorIcons() {
        return this.data.showOptionalIndicatorIcons;
    }
    set showOptionalIndicatorIcons(value) {
        this.data.showOptionalIndicatorIcons = value;
    }
    get overrideStandardModeBehaviors() {
        return this.data.overrideStandardModeBehaviors;
    }
    set overrideStandardModeBehaviors(value) {
        this.data.overrideStandardModeBehaviors = value;
    }
    get enabledRibbonCommands() {
        return this.data.enabledRibbonCommands;
    }
    set enabledRibbonCommands(value) {
        // remove any duplicates before storing
        this.data.enabledRibbonCommands = [...new Set(value)];
    }
    get fileExtAllowList() {
        return this.data.fileExtAllowList;
    }
    set fileExtAllowList(value) {
        this.data.fileExtAllowList = value;
    }
    get matchPriorityAdjustments() {
        return this.data.matchPriorityAdjustments;
    }
    set matchPriorityAdjustments(value) {
        this.data.matchPriorityAdjustments = value;
    }
    get quickFilters() {
        return this.data.quickFilters;
    }
    set quickFilters(value) {
        this.data.quickFilters = value;
    }
    get preserveCommandPaletteLastInput() {
        return this.data.preserveCommandPaletteLastInput;
    }
    set preserveCommandPaletteLastInput(value) {
        this.data.preserveCommandPaletteLastInput = value;
    }
    get preserveQuickSwitcherLastInput() {
        return this.data.preserveQuickSwitcherLastInput;
    }
    set preserveQuickSwitcherLastInput(value) {
        this.data.preserveQuickSwitcherLastInput = value;
    }
    get shouldCloseModalOnBackspace() {
        return this.data.shouldCloseModalOnBackspace;
    }
    set shouldCloseModalOnBackspace(value) {
        this.data.shouldCloseModalOnBackspace = value;
    }
    get maxRecentFileSuggestionsOnInit() {
        return this.data.maxRecentFileSuggestionsOnInit;
    }
    set maxRecentFileSuggestionsOnInit(value) {
        this.data.maxRecentFileSuggestionsOnInit = value;
    }
    get orderEditorListByAccessTime() {
        return this.data.orderEditorListByAccessTime;
    }
    set orderEditorListByAccessTime(value) {
        this.data.orderEditorListByAccessTime = value;
    }
    get insertLinkInEditor() {
        return this.data.insertLinkInEditor;
    }
    set insertLinkInEditor(value) {
        this.data.insertLinkInEditor = value;
    }
    get removeDefaultTabBinding() {
        return this.data.removeDefaultTabBinding;
    }
    set removeDefaultTabBinding(value) {
        this.data.removeDefaultTabBinding = value;
    }
    get navigationKeys() {
        return this.data.navigationKeys;
    }
    set navigationKeys(value) {
        this.data.navigationKeys = value;
    }
    get preferredSourceForTitle() {
        return this.data.preferredSourceForTitle;
    }
    set preferredSourceForTitle(value) {
        this.data.preferredSourceForTitle = value;
    }
    get closeWhenEmptyKeys() {
        return this.data.closeWhenEmptyKeys;
    }
    set closeWhenEmptyKeys(value) {
        this.data.closeWhenEmptyKeys = value;
    }
    get escapeCmdChar() {
        return this.data.escapeCmdChar;
    }
    set escapeCmdChar(value) {
        this.data.escapeCmdChar = value;
    }
    get mobileLauncher() {
        return this.data.mobileLauncher;
    }
    set mobileLauncher(value) {
        this.data.mobileLauncher = value;
    }
    constructor(plugin) {
        this.plugin = plugin;
        this.data = SwitcherPlusSettings.defaults;
    }
    async updateDataAndLoadSettings() {
        await SwitcherPlusSettings.transformDataFile(this.plugin, SwitcherPlusSettings.defaults);
        return await this.loadSettings();
    }
    async loadSettings() {
        const copy = (savedData, defaultData, keys) => {
            const keysToMerge = ['matchPriorityAdjustments', 'quickFilters'];
            const deepMerge = (key) => {
                return merge.withOptions({ mergeArrays: false }, defaultData[key], savedData[key]);
            };
            for (const key of keys) {
                if (key in savedData) {
                    defaultData[key] = keysToMerge.includes(key)
                        ? deepMerge(key)
                        : savedData[key];
                }
            }
        };
        try {
            const savedData = (await this.plugin?.loadData());
            if (savedData) {
                const keys = Object.keys(SwitcherPlusSettings.defaults);
                copy(savedData, this.data, keys);
            }
        }
        catch (err) {
            console.log('Switcher++: error loading settings, using defaults. ', err);
        }
    }
    async saveSettings() {
        const { plugin, data } = this;
        await plugin?.saveData(data);
    }
    save() {
        this.saveSettings().catch((e) => {
            console.log('Switcher++: error saving changes to settings', e);
        });
    }
    isSymbolTypeEnabled(symbol) {
        const { enabledSymbolTypes } = this.data;
        let value = SwitcherPlusSettings.defaults.enabledSymbolTypes[symbol];
        if (Object.prototype.hasOwnProperty.call(enabledSymbolTypes, symbol)) {
            value = enabledSymbolTypes[symbol];
        }
        return value;
    }
    setSymbolTypeEnabled(symbol, isEnabled) {
        this.data.enabledSymbolTypes[symbol] = isEnabled;
    }
    static async transformDataFile(plugin, defaults) {
        await SwitcherPlusSettings.transformDataFileToV1(plugin, defaults);
        await SwitcherPlusSettings.transformDataFileToV2(plugin, defaults);
    }
    static async transformDataFileToV1(plugin, defaults) {
        let isTransformed = false;
        try {
            const data = (await plugin?.loadData());
            if (data && typeof data === 'object') {
                const versionKey = 'version';
                if (!Object.prototype.hasOwnProperty.call(data, versionKey)) {
                    // rename from starred to bookmarks
                    const starredCommandKey = 'starredListCommand';
                    if (Object.prototype.hasOwnProperty.call(data, starredCommandKey)) {
                        data['bookmarksListCommand'] =
                            data[starredCommandKey] ?? defaults.bookmarksListCommand;
                        delete data[starredCommandKey];
                    }
                    // rename isStarred to isBookmarked
                    const isStarredKey = 'isStarred';
                    const adjustments = data['matchPriorityAdjustments'];
                    if (adjustments &&
                        Object.prototype.hasOwnProperty.call(adjustments, isStarredKey)) {
                        adjustments['isBookmarked'] = adjustments[isStarredKey];
                        delete adjustments[isStarredKey];
                    }
                    data[versionKey] = '1.0.0';
                    await plugin?.saveData(data);
                    isTransformed = true;
                }
            }
        }
        catch (error) {
            console.log('Switcher++: error transforming data.json to v1.0.0', error);
        }
        return isTransformed;
    }
    static async transformDataFileToV2(plugin, defaults) {
        let isTransformed = false;
        try {
            const data = (await plugin?.loadData());
            if (data && typeof data === 'object') {
                const versionKey = 'version';
                if (data[versionKey] === '1.0.0') {
                    const matchPriorityAdjustmentsKey = 'matchPriorityAdjustments';
                    if (Object.prototype.hasOwnProperty.call(data, matchPriorityAdjustmentsKey)) {
                        // Convert matchPriorityAdjustments to key/object pairs
                        // Version <= 1.0.0 type was Record<string, number>
                        const oldAdjustments = data[matchPriorityAdjustmentsKey];
                        const adjustments = {};
                        data[matchPriorityAdjustmentsKey] = {
                            isEnabled: !!data['enableMatchPriorityAdjustments'],
                            adjustments,
                        };
                        delete data['enableMatchPriorityAdjustments'];
                        Object.entries(oldAdjustments).forEach(([key, value]) => {
                            const label = defaults.matchPriorityAdjustments.adjustments[key]?.label ?? '';
                            adjustments[key] = { value, label };
                        });
                    }
                    const quickFiltersKey = 'quickFilters';
                    if (Object.prototype.hasOwnProperty.call(data, quickFiltersKey)) {
                        // convert .facetList from Array<Object> to Record<string, Object>
                        const facetListKey = 'facetList';
                        const quickFiltersData = data[quickFiltersKey];
                        const oldFacetList = quickFiltersData[facetListKey];
                        const facetList = oldFacetList?.reduce((facetMap, oldFacet) => {
                            const facetId = oldFacet['id'];
                            facetMap[facetId] = oldFacet;
                            return facetMap;
                        }, {});
                        quickFiltersData[facetListKey] = facetList;
                    }
                    data[versionKey] = '2.0.0';
                    await plugin?.saveData(data);
                    isTransformed = true;
                }
            }
        }
        catch (error) {
            console.log('Switcher++: error transforming data.json to v2.0.0', error);
        }
        return isTransformed;
    }
}

class SettingsTabSection {
    constructor(app, mainSettingsTab, config) {
        this.app = app;
        this.mainSettingsTab = mainSettingsTab;
        this.config = config;
    }
    /**
     * Creates a new Setting with the given name and description.
     * @param  {HTMLElement} containerEl
     * @param  {string} name
     * @param  {string} desc
     * @returns Setting
     */
    createSetting(containerEl, name, desc) {
        const setting = new obsidian.Setting(containerEl);
        setting.setName(name);
        setting.setDesc(desc);
        return setting;
    }
    /**
     * Create section title elements and divider.
     * @param  {HTMLElement} containerEl
     * @param  {string} title
     * @param  {string} desc?
     * @returns Setting
     */
    addSectionTitle(containerEl, title, desc = '') {
        const setting = this.createSetting(containerEl, title, desc);
        setting.setHeading();
        return setting;
    }
    /**
     * Creates a HTMLInput element setting.
     * @param  {HTMLElement} containerEl The element to attach the setting to.
     * @param  {string} name
     * @param  {string} desc
     * @param  {string} initialValue
     * @param  {StringTypedConfigKey} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored.
     * @param  {string} placeholderText?
     * @returns Setting
     */
    addTextSetting(containerEl, name, desc, initialValue, configStorageKey, placeholderText) {
        const setting = this.createSetting(containerEl, name, desc);
        setting.addText((comp) => {
            comp.setPlaceholder(placeholderText);
            comp.setValue(initialValue);
            comp.onChange((rawValue) => {
                const value = rawValue.length ? rawValue : initialValue;
                this.saveChangesToConfig(configStorageKey, value);
            });
        });
        return setting;
    }
    /**
     * Create a Checkbox element setting.
     * @param  {HTMLElement} containerEl The element to attach the setting to.
     * @param  {string} name
     * @param  {string} desc
     * @param  {boolean} initialValue
     * @param  {BooleanTypedConfigKey} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored. This can safely be set to null if the onChange handler is provided.
     * @param  {(value:string,config:SwitcherPlusSettings)=>void} onChange? optional callback to invoke instead of using configStorageKey
     * @returns Setting
     */
    addToggleSetting(containerEl, name, desc, initialValue, configStorageKey, onChange) {
        const setting = this.createSetting(containerEl, name, desc);
        setting.addToggle((comp) => {
            comp.setValue(initialValue);
            comp.onChange((value) => {
                if (onChange) {
                    onChange(value, this.config);
                }
                else {
                    this.saveChangesToConfig(configStorageKey, value);
                }
            });
        });
        return setting;
    }
    /**
     * Create a TextArea element setting.
     * @param  {HTMLElement} containerEl The element to attach the setting to.
     * @param  {string} name
     * @param  {string} desc
     * @param  {string} initialValue
     * @param  {ListTypedConfigKey|StringTypedConfigKey} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored.
     * @param  {string} placeholderText?
     * @returns Setting
     */
    addTextAreaSetting(containerEl, name, desc, initialValue, configStorageKey, placeholderText) {
        const setting = this.createSetting(containerEl, name, desc);
        setting.addTextArea((comp) => {
            comp.setPlaceholder(placeholderText);
            comp.setValue(initialValue);
            comp.onChange((rawValue) => {
                const value = rawValue.length ? rawValue : initialValue;
                const isArray = Array.isArray(this.config[configStorageKey]);
                this.saveChangesToConfig(configStorageKey, isArray ? value.split('\n') : value);
            });
        });
        return setting;
    }
    /**
     * Add a dropdown list setting
     * @param  {HTMLElement} containerEl
     * @param  {string} name
     * @param  {string} desc
     * @param  {string} initialValue option value that is initially selected
     * @param  {Record<string, string>} options
     * @param  {StringTypedConfigKey} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored. This can safely be set to null if the onChange handler is provided.
     * @param  {(rawValue:string,config:SwitcherPlusSettings)=>void} onChange? optional callback to invoke instead of using configStorageKey
     * @returns Setting
     */
    addDropdownSetting(containerEl, name, desc, initialValue, options, configStorageKey, onChange) {
        const setting = this.createSetting(containerEl, name, desc);
        setting.addDropdown((comp) => {
            comp.addOptions(options);
            comp.setValue(initialValue);
            comp.onChange((rawValue) => {
                if (onChange) {
                    onChange(rawValue, this.config);
                }
                else {
                    this.saveChangesToConfig(configStorageKey, rawValue);
                }
            });
        });
        return setting;
    }
    addSliderSetting(containerEl, name, desc, initialValue, limits, configStorageKey, onChange) {
        const setting = this.createSetting(containerEl, name, desc);
        // display a button to reset the slider value
        setting.addExtraButton((comp) => {
            comp.setIcon('lucide-rotate-ccw');
            comp.setTooltip('Restore default');
            comp.onClick(() => setting.components[1].setValue(0));
            return comp;
        });
        setting.addSlider((comp) => {
            comp.setLimits(limits[0], limits[1], limits[2]);
            comp.setValue(initialValue);
            comp.setDynamicTooltip();
            comp.onChange((value) => {
                if (onChange) {
                    onChange(value, this.config);
                }
                else {
                    this.saveChangesToConfig(configStorageKey, value);
                }
            });
        });
        return setting;
    }
    /**
     * Updates the internal SwitcherPlusSettings configStorageKey with value, and writes it to disk.
     * @param  {K} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored.
     * @param  {SwitcherPlusSettings[K]} value
     * @returns void
     */
    saveChangesToConfig(configStorageKey, value) {
        if (configStorageKey) {
            const { config } = this;
            config[configStorageKey] = value;
            config.save();
        }
    }
}

class BookmarksSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Bookmarks List Mode Settings');
        this.addTextSetting(containerEl, 'Bookmarks list mode trigger', 'Character that will trigger bookmarks list mode in the switcher', config.bookmarksListCommand, 'bookmarksListCommand', config.bookmarksListPlaceholderText);
    }
}

class CommandListSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Command List Mode Settings');
        this.addTextSetting(containerEl, 'Command list mode trigger', 'Character that will trigger command list mode in the switcher', config.commandListCommand, 'commandListCommand', config.commandListPlaceholderText);
    }
}

class RelatedItemsSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Related Items List Mode Settings');
        this.addTextSetting(containerEl, 'Related Items list mode trigger', 'Character that will trigger related items list mode in the switcher. This triggers a display of Related Items for the source file of the currently selected (highlighted) suggestion in the switcher. If there is not a suggestion, display results for the active editor.', config.relatedItemsListCommand, 'relatedItemsListCommand', config.relatedItemsListPlaceholderText);
        this.addTextSetting(containerEl, 'Related Items list mode trigger - Active editor only', 'Character that will trigger related items list mode in the switcher. This always triggers a display of Related Items for the active editor only.', config.relatedItemsListActiveEditorCommand, 'relatedItemsListActiveEditorCommand', config.relatedItemsListActiveEditorCommand);
        this.showEnabledRelatedItems(containerEl, config);
        this.addToggleSetting(containerEl, 'Exclude open files', 'Enable, related files which are already open will not be displayed in the list. Disabled, All related files will be displayed in the list.', config.excludeOpenRelatedFiles, 'excludeOpenRelatedFiles');
    }
    showEnabledRelatedItems(containerEl, config) {
        const relationTypes = Object.values(RelationType).sort();
        const relationTypesStr = relationTypes.join(', ');
        const desc = `The types of related items to show in the list. Add one type per line. Available types: ${relationTypesStr}`;
        this.createSetting(containerEl, 'Show related item types', desc).addTextArea((textArea) => {
            textArea.setValue(config.enabledRelatedItems.join('\n'));
            textArea.inputEl.addEventListener('focusout', () => {
                const values = textArea
                    .getValue()
                    .split('\n')
                    .map((v) => v.trim())
                    .filter((v) => v.length > 0);
                const invalidValues = [...new Set(values)].filter((v) => !relationTypes.includes(v));
                if (invalidValues?.length) {
                    this.showErrorPopup(invalidValues.join('<br/>'), relationTypesStr);
                }
                else {
                    config.enabledRelatedItems = values;
                    config.save();
                }
            });
        });
    }
    showErrorPopup(invalidTypes, relationTypes) {
        const popup = new obsidian.Modal(this.app);
        popup.titleEl.setText('Invalid related item type');
        popup.contentEl.innerHTML = `Changes not saved. Available relation types are: ${relationTypes}. The following types are invalid:<br/><br/>${invalidTypes}`;
        popup.open();
    }
}

class GeneralSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'General Settings');
        this.showEnabledRibbonCommands(containerEl, config);
        this.showOverrideMobileLauncher(containerEl, config);
        this.showPreferredSourceForTitle(containerEl, config);
        this.showPathDisplayFormat(containerEl, config);
        this.addToggleSetting(containerEl, 'Hide path for root items', 'When enabled, path information will be hidden for items at the root of the vault.', config.hidePathIfRoot, 'hidePathIfRoot').setClass('qsp-setting-item-indent');
        this.addTextSetting(containerEl, 'Mode trigger escape character', 'Character to indicate that a mode trigger character should be treated just as a normal text.', config.escapeCmdChar, 'escapeCmdChar');
        this.addToggleSetting(containerEl, 'Default to open in new tab', 'When enabled, navigating to un-opened files will open a new editor tab whenever possible (as if cmd/ctrl were held). When the file is already open, the existing tab will be activated. This overrides all other tab settings.', config.onOpenPreferNewTab, 'onOpenPreferNewTab');
        this.addToggleSetting(containerEl, 'Override Standard mode behavior', 'When enabled, Switcher++ will change the default Obsidian builtin Switcher functionality (Standard mode) to inject custom behavior.', config.overrideStandardModeBehaviors, 'overrideStandardModeBehaviors');
        this.addToggleSetting(containerEl, 'Show indicator icons', 'Display icons to indicate that an item is recent, bookmarked, etc..', config.showOptionalIndicatorIcons, 'showOptionalIndicatorIcons');
        this.addToggleSetting(containerEl, 'Allow Backspace key to close the Switcher', 'When the search box is empty, pressing the backspace key will close Switcher++.', config.shouldCloseModalOnBackspace, 'shouldCloseModalOnBackspace');
        this.showMatchPriorityAdjustments(containerEl, config);
        this.showInsertLinkInEditor(containerEl, config);
        this.addToggleSetting(containerEl, 'Restore previous input in Command Mode', 'When enabled, restore the last typed input in Command Mode when launched via global command hotkey.', config.preserveCommandPaletteLastInput, 'preserveCommandPaletteLastInput');
        this.addToggleSetting(containerEl, 'Restore previous input', 'When enabled, restore the last typed input when launched via global command hotkey.', config.preserveQuickSwitcherLastInput, 'preserveQuickSwitcherLastInput');
        this.showResetFacetEachSession(containerEl, config);
    }
    showPreferredSourceForTitle(containerEl, config) {
        const options = {
            H1: 'First H₁ heading',
            Default: 'Default',
        };
        this.addDropdownSetting(containerEl, 'Preferred suggestion title source', 'The preferred source to use for the "title" text that will be searched and displayed for file based suggestions', config.preferredSourceForTitle, options, 'preferredSourceForTitle');
    }
    showPathDisplayFormat(containerEl, config) {
        const options = {};
        options[PathDisplayFormat.None.toString()] = 'Hide path';
        options[PathDisplayFormat.Full.toString()] = 'Full path';
        options[PathDisplayFormat.FolderOnly.toString()] = 'Only parent folder';
        options[PathDisplayFormat.FolderWithFilename.toString()] = 'Parent folder & filename';
        options[PathDisplayFormat.FolderPathFilenameOptional.toString()] =
            'Parent folder path (filename optional)';
        this.addDropdownSetting(containerEl, 'Preferred file path display format', 'The preferred way to display file paths in suggestions', config.pathDisplayFormat.toString(), options, null, (rawValue, config) => {
            config.pathDisplayFormat = Number(rawValue);
            config.save();
        });
    }
    showEnabledRibbonCommands(containerEl, config) {
        const modeNames = Object.values(Mode)
            .filter((v) => isNaN(Number(v)))
            .sort();
        const modeNamesStr = modeNames.join(' ');
        const desc = `Display an icon in the ribbon menu to launch specific modes. Add one mode per line. Available modes: ${modeNamesStr}`;
        this.createSetting(containerEl, 'Show ribbon icons', desc).addTextArea((textArea) => {
            textArea.setValue(config.enabledRibbonCommands.join('\n'));
            textArea.inputEl.addEventListener('focusout', () => {
                const values = textArea
                    .getValue()
                    .split('\n')
                    .map((v) => v.trim())
                    .filter((v) => v.length > 0);
                const invalidValues = Array.from(new Set(values)).filter((v) => !modeNames.includes(v));
                if (invalidValues.length) {
                    this.showErrorPopup(invalidValues.join('<br/>'), modeNamesStr);
                }
                else {
                    config.enabledRibbonCommands = values;
                    config.save();
                    // force unregister/register of ribbon commands, so the changes take
                    // effect immediately
                    this.mainSettingsTab.plugin.registerRibbonCommandIcons();
                }
            });
        });
    }
    showErrorPopup(invalidValues, validModes) {
        const popup = new obsidian.Modal(this.app);
        popup.titleEl.setText('Invalid mode');
        popup.contentEl.innerHTML = `Changes not saved. Available modes are: ${validModes}. The following are invalid:<br/><br/>${invalidValues}`;
        popup.open();
    }
    showOverrideMobileLauncher(containerEl, config) {
        const { mobileLauncher } = config;
        const desc = 'Override the "⊕" button (in the Navigation Bar) on mobile platforms to launch Switcher++ instead of the default system switcher. Select the Mode to launch Switcher++ in, or select "Do not override" to disable the feature.';
        const disableOptionKey = 'disabled'; // Option to disable the feature
        const options = { [disableOptionKey]: 'Do not override' };
        // Add each mode to the list of options
        const modeNames = getModeNames();
        modeNames.forEach((name) => {
            options[name] = name;
        });
        let initialValue = disableOptionKey;
        if (mobileLauncher.isEnabled &&
            modeNames.includes(mobileLauncher.modeString)) {
            initialValue = mobileLauncher.modeString;
        }
        this.addDropdownSetting(containerEl, 'Override default Switcher launch button (the "⊕" button) on mobile platforms', desc, initialValue, options, null, (rawValue, config) => {
            const isEnabled = rawValue !== disableOptionKey;
            config.mobileLauncher.isEnabled = isEnabled;
            if (isEnabled) {
                config.mobileLauncher.modeString = rawValue;
            }
            config.save();
            this.mainSettingsTab.plugin.updateMobileLauncherButtonOverride(isEnabled);
        });
    }
    showMatchPriorityAdjustments(containerEl, config) {
        const { matchPriorityAdjustments: { isEnabled, adjustments, fileExtAdjustments }, } = config;
        this.addToggleSetting(containerEl, 'Result priority adjustments', 'Artificially increase the match score of the specified item types by a fixed percentage so they appear higher in the results list (does not apply to Standard Mode).', isEnabled, null, (isEnabled, config) => {
            config.matchPriorityAdjustments.isEnabled = isEnabled;
            // have to wait for the save here because the call to display() will
            // trigger a read of the updated data
            config.saveSettings().then(() => {
                // reload the settings panel. This will cause the matchPriorityAdjustments
                // controls to be shown/hidden based on isEnabled status
                this.mainSettingsTab.display();
            }, (reason) => console.log('Switcher++: error saving "Result Priority Adjustments" setting. ', reason));
        });
        if (isEnabled) {
            [adjustments, fileExtAdjustments].forEach((collection) => {
                Object.entries(collection).forEach(([key, data]) => {
                    const { value, label } = data;
                    const setting = this.addSliderSetting(containerEl, label, data.desc ?? '', value, [-1, 1, 0.05], null, (value, config) => {
                        collection[key].value = value;
                        config.save();
                    });
                    setting.setClass('qsp-setting-item-indent');
                });
            });
        }
    }
    showResetFacetEachSession(containerEl, config) {
        this.addToggleSetting(containerEl, 'Reset active Quick Filters', 'When enabled, the switcher will reset all Quick Filters back to inactive for each session.', config.quickFilters.shouldResetActiveFacets, null, (value, config) => {
            config.quickFilters.shouldResetActiveFacets = value;
            config.save();
        });
    }
    showInsertLinkInEditor(containerEl, config) {
        this.createSetting(containerEl, 'Insert link in editor', '');
        let setting = this.addToggleSetting(containerEl, 'Use filename as alias', 'When enabled, the file basename will be set as the link alias.', config.insertLinkInEditor.useBasenameAsAlias, null, (value, config) => {
            config.insertLinkInEditor.useBasenameAsAlias = value;
            config.save();
        });
        setting.setClass('qsp-setting-item-indent');
        setting = this.addToggleSetting(containerEl, 'Use heading as alias', 'When enabled, the file heading will be set as the link alias. This overrides the "use filename as alias" setting.', config.insertLinkInEditor.useHeadingAsAlias, null, (value, config) => {
            config.insertLinkInEditor.useHeadingAsAlias = value;
            config.save();
        });
        setting.setClass('qsp-setting-item-indent');
    }
}

class WorkspaceSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Workspace List Mode Settings');
        this.addTextSetting(containerEl, 'Workspace list mode trigger', 'Character that will trigger workspace list mode in the switcher', config.workspaceListCommand, 'workspaceListCommand', config.workspaceListPlaceholderText);
    }
}

class EditorSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Editor List Mode Settings');
        this.addTextSetting(containerEl, 'Editor list mode trigger', 'Character that will trigger editor list mode in the switcher', config.editorListCommand, 'editorListCommand', config.editorListPlaceholderText);
        this.showIncludeSidePanelViews(containerEl, config);
        this.addToggleSetting(containerEl, 'Order default editor list by most recently accessed', 'When there is no search term, order the list of editors by most recent access time.', config.orderEditorListByAccessTime, 'orderEditorListByAccessTime');
    }
    showIncludeSidePanelViews(containerEl, config) {
        const viewsListing = Object.keys(this.app.viewRegistry.viewByType).sort().join(' ');
        const desc = `When in Editor list mode, show the following view types from the side panels. Add one view type per line. Available view types: ${viewsListing}`;
        this.addTextAreaSetting(containerEl, 'Include side panel views', desc, config.includeSidePanelViewTypes.join('\n'), 'includeSidePanelViewTypes', config.includeSidePanelViewTypesPlaceholder);
    }
}

class HeadingsSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Headings List Mode Settings');
        this.addTextSetting(containerEl, 'Headings list mode trigger', 'Character that will trigger headings list mode in the switcher', config.headingsListCommand, 'headingsListCommand', config.headingsListPlaceholderText);
        this.showHeadingSettings(containerEl, config);
        this.addToggleSetting(containerEl, 'Search Filenames', "Enabled, search and show suggestions for filenames. Disabled, Don't search through filenames (except for fallback searches)", config.shouldSearchFilenames, 'shouldSearchFilenames');
        this.addToggleSetting(containerEl, 'Search Bookmarks', "Enabled, search and show suggestions for Bookmarks. Disabled, Don't search through Bookmarks", config.shouldSearchBookmarks, 'shouldSearchBookmarks');
        this.addSliderSetting(containerEl, 'Max recent files to show', 'The maximum number of recent files to show when there is no search term', config.maxRecentFileSuggestionsOnInit, [0, 75, 1], 'maxRecentFileSuggestionsOnInit');
        this.showExcludeFolders(containerEl, config);
        this.addToggleSetting(containerEl, 'Hide Obsidian "Excluded files"', 'Enabled, do not display suggestions for files that are in Obsidian\'s "Options > Files & Links > Excluded files" list. Disabled, suggestions for those files will be displayed but downranked.', config.excludeObsidianIgnoredFiles, 'excludeObsidianIgnoredFiles');
        this.showFileExtAllowList(containerEl, config);
    }
    showHeadingSettings(containerEl, config) {
        const isEnabled = config.shouldSearchHeadings;
        this.addToggleSetting(containerEl, 'Search Headings', "Enabled, search and show suggestions for Headings. Disabled, Don't search through Headings", isEnabled, null, (isEnabled, config) => {
            config.shouldSearchHeadings = isEnabled;
            // have to wait for the save here because the call to display() will
            // trigger a read of the updated data
            config.saveSettings().then(() => {
                // reload the settings panel. This will cause the other option
                // controls to be shown/hidden based on isEnabled status
                this.mainSettingsTab.display();
            }, (reason) => console.log('Switcher++: error saving "Search Headings" setting. ', reason));
        });
        if (isEnabled) {
            let setting = this.addToggleSetting(containerEl, 'Turn off filename fallback', 'Enabled, strictly search through only the headings contained in the file. Do not fallback to searching the filename when an H1 match is not found. Disabled, fallback to searching against the filename when there is not a match in the first H1 contained in the file.', config.strictHeadingsOnly, 'strictHeadingsOnly');
            setting.setClass('qsp-setting-item-indent');
            setting = this.addToggleSetting(containerEl, 'Search all headings', 'Enabled, search through all headings contained in each file. Disabled, only search through the first H1 in each file.', config.searchAllHeadings, 'searchAllHeadings');
            setting.setClass('qsp-setting-item-indent');
        }
    }
    showFileExtAllowList(containerEl, config) {
        this.createSetting(containerEl, 'File extension override', 'Override the "Show attachments" and the "Show all file types" builtin, system Switcher settings and always search files with the listed extensions. Add one path per line. For example to add ".canvas" file extension, just add "canvas".').addTextArea((textArea) => {
            textArea.setValue(config.fileExtAllowList.join('\n'));
            textArea.inputEl.addEventListener('focusout', () => {
                const allowList = textArea
                    .getValue()
                    .split('\n')
                    .map((v) => v.trim())
                    .filter((v) => v.length > 0);
                config.fileExtAllowList = allowList;
                config.save();
            });
        });
    }
    showExcludeFolders(containerEl, config) {
        const settingName = 'Exclude folders';
        this.createSetting(containerEl, settingName, 'When in Headings list mode, folder path that match any regex listed here will not be searched for suggestions. Path should start from the Vault Root. Add one path per line.').addTextArea((textArea) => {
            textArea.setValue(config.excludeFolders.join('\n'));
            textArea.inputEl.addEventListener('focusout', () => {
                const excludes = textArea
                    .getValue()
                    .split('\n')
                    .filter((v) => v.length > 0);
                if (this.validateExcludeFolderList(settingName, excludes)) {
                    config.excludeFolders = excludes;
                    config.save();
                }
            });
        });
    }
    validateExcludeFolderList(settingName, excludes) {
        let isValid = true;
        let failedMsg = '';
        for (const str of excludes) {
            try {
                new RegExp(str);
            }
            catch (err) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                failedMsg += `<span class="qsp-warning">${str}</span><br/>${err}<br/><br/>`;
                isValid = false;
            }
        }
        if (!isValid) {
            const popup = new obsidian.Modal(this.app);
            popup.titleEl.setText(settingName);
            popup.contentEl.innerHTML = `Changes not saved. The following regex contain errors:<br/><br/>${failedMsg}`;
            popup.open();
        }
        return isValid;
    }
}

class SymbolSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Symbol List Mode Settings');
        this.addTextSetting(containerEl, 'Symbol list mode trigger', 'Character that will trigger symbol list mode in the switcher. This triggers a display of Symbols for the source file of the currently selected (highlighted) suggestion in the switcher. If there is not a suggestion, display results for the active editor.', config.symbolListCommand, 'symbolListCommand', config.symbolListPlaceholderText);
        this.addTextSetting(containerEl, 'Symbol list mode trigger - Active editor only', 'Character that will trigger symbol list mode in the switcher. This always triggers a display of Symbols for the active editor only.', config.symbolListActiveEditorCommand, 'symbolListActiveEditorCommand', config.symbolListActiveEditorCommand);
        this.addToggleSetting(containerEl, 'List symbols as indented outline', 'Enabled, symbols will be displayed in the (line) order they appear in the source text, indented under any preceding heading. Disabled, symbols will be grouped by type: Headings, Tags, Links, Embeds.', config.symbolsInLineOrder, 'symbolsInLineOrder');
        this.addToggleSetting(containerEl, 'Open Symbols in new tab', 'Enabled, always open a new tab when navigating to Symbols. Disabled, navigate in an already open tab (if one exists).', config.alwaysNewTabForSymbols, 'alwaysNewTabForSymbols');
        this.addToggleSetting(containerEl, 'Open Symbols in active tab on mobile devices', 'Enabled, navigate to the target file and symbol in the active editor tab. Disabled, open a new tab when navigating to Symbols, even on mobile devices.', config.useActiveTabForSymbolsOnMobile, 'useActiveTabForSymbolsOnMobile');
        this.addToggleSetting(containerEl, 'Auto-select nearest heading', 'Enabled, in an unfiltered symbol list, select the closest preceding Heading to the current cursor position. Disabled, the first symbol in the list is selected.', config.selectNearestHeading, 'selectNearestHeading');
        this.showEnableSymbolTypesToggle(containerEl, config);
        this.showEnableLinksToggle(containerEl, config);
    }
    showEnableSymbolTypesToggle(containerEl, config) {
        const allowedSymbols = [
            ['Show Headings', SymbolType.Heading],
            ['Show Tags', SymbolType.Tag],
            ['Show Embeds', SymbolType.Embed],
            ['Show Callouts', SymbolType.Callout],
        ];
        allowedSymbols.forEach(([name, symbolType]) => {
            this.addToggleSetting(containerEl, name, '', config.isSymbolTypeEnabled(symbolType), null, (isEnabled) => {
                config.setSymbolTypeEnabled(symbolType, isEnabled);
                config.save();
            });
        });
    }
    showEnableLinksToggle(containerEl, config) {
        const isLinksEnabled = config.isSymbolTypeEnabled(SymbolType.Link);
        this.addToggleSetting(containerEl, 'Show Links', '', isLinksEnabled, null, (isEnabled) => {
            config.setSymbolTypeEnabled(SymbolType.Link, isEnabled);
            // have to wait for the save here because the call to display() will
            // trigger a read of the updated data
            config.saveSettings().then(() => {
                // reload the settings panel. This will cause the sublink types toggle
                // controls to be shown/hidden based on isLinksEnabled status
                this.mainSettingsTab.display();
            }, (reason) => console.log('Switcher++: error saving "Show Links" setting. ', reason));
        });
        if (isLinksEnabled) {
            const allowedLinkTypes = [
                ['Links to headings', LinkType.Heading],
                ['Links to blocks', LinkType.Block],
            ];
            allowedLinkTypes.forEach(([name, linkType]) => {
                const isExcluded = (config.excludeLinkSubTypes & linkType) === linkType;
                const setting = this.addToggleSetting(containerEl, name, '', !isExcluded, null, (isEnabled) => this.saveEnableSubLinkChange(linkType, isEnabled));
                setting.setClass('qsp-setting-item-indent');
            });
        }
    }
    saveEnableSubLinkChange(linkType, isEnabled) {
        const { config } = this;
        let exclusions = config.excludeLinkSubTypes;
        if (isEnabled) {
            // remove from exclusion list
            exclusions &= ~linkType;
        }
        else {
            // add to exclusion list
            exclusions |= linkType;
        }
        config.excludeLinkSubTypes = exclusions;
        config.save();
    }
}

class VaultListSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        const titleSetting = this.addSectionTitle(containerEl, 'Vault List Mode Settings');
        titleSetting.nameEl?.createSpan({
            cls: ['qsp-tag', 'qsp-warning'],
            text: 'Experimental',
        });
        this.addTextSetting(containerEl, 'Vault list mode trigger', 'Character that will trigger vault list mode in the switcher', config.vaultListCommand, 'vaultListCommand', config.vaultListPlaceholderText);
    }
}

class SwitcherPlusSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin, config) {
        super(app, plugin);
        this.plugin = plugin;
        this.config = config;
    }
    display() {
        const { containerEl } = this;
        const tabSections = [
            GeneralSettingsTabSection,
            SymbolSettingsTabSection,
            HeadingsSettingsTabSection,
            EditorSettingsTabSection,
            RelatedItemsSettingsTabSection,
            BookmarksSettingsTabSection,
            CommandListSettingsTabSection,
            WorkspaceSettingsTabSection,
            VaultListSettingsTabSection,
        ];
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Quick Switcher++ Settings' });
        tabSections.forEach((tabSectionClass) => {
            this.displayTabSection(tabSectionClass);
        });
    }
    displayTabSection(tabSectionClass) {
        const { app, config, containerEl } = this;
        const tabSection = new tabSectionClass(app, this, config);
        tabSection.display(containerEl);
    }
}

class InputInfo {
    static get defaultParsedCommand() {
        return {
            isValidated: false,
            index: -1,
            parsedInput: null,
        };
    }
    get searchQuery() {
        return this._searchQuery;
    }
    get inputTextSansEscapeChar() {
        return this._inputTextSansEscapeChar ?? this.inputText;
    }
    set inputTextSansEscapeChar(value) {
        this._inputTextSansEscapeChar = value;
    }
    constructor(inputText = '', mode = Mode.Standard, sessionOpts) {
        this.inputText = inputText;
        this.mode = mode;
        this._inputTextSansEscapeChar = null;
        this.currentWorkspaceEnvList = {
            openWorkspaceLeaves: new Set(),
            openWorkspaceFiles: new Set(),
            fileBookmarks: new Map(),
            nonFileBookmarks: new Set(),
            mostRecentFiles: new Set(),
            attachmentFileExtensions: new Set(),
        };
        this.sessionOpts = sessionOpts ?? {};
        const symbolListCmd = {
            ...InputInfo.defaultParsedCommand,
            source: null,
        };
        const relatedItemsListCmd = {
            ...InputInfo.defaultParsedCommand,
            source: null,
        };
        const parsedCmds = {};
        this.parsedCommands = parsedCmds;
        parsedCmds[Mode.SymbolList] = symbolListCmd;
        parsedCmds[Mode.RelatedItemsList] = relatedItemsListCmd;
        [
            Mode.Standard,
            Mode.EditorList,
            Mode.WorkspaceList,
            Mode.HeadingsList,
            Mode.BookmarksList,
            Mode.CommandList,
            Mode.VaultList,
        ].forEach((mode) => {
            parsedCmds[mode] = InputInfo.defaultParsedCommand;
        });
    }
    buildSearchQuery() {
        const { mode } = this;
        const input = this.parsedCommands[mode].parsedInput ?? '';
        const prepQuery = obsidian.prepareQuery(input.trim().toLowerCase());
        const hasSearchTerm = prepQuery?.query?.length > 0;
        this._searchQuery = { prepQuery, hasSearchTerm };
    }
    parsedCommand(mode) {
        mode = mode ?? this.mode;
        return this.parsedCommands[mode];
    }
}

class Handler {
    constructor(app, settings) {
        this.app = app;
        this.settings = settings;
    }
    reset() {
        /* noop */
    }
    onNoResultsCreateAction(_inputInfo, _evt) {
        return false;
    }
    getFacets(mode) {
        if (!this.facets) {
            const facetList = this.settings?.quickFilters?.facetList;
            if (facetList) {
                this.facets = Object.values(facetList).filter((facet) => facet.mode === mode);
            }
        }
        return this.facets ?? [];
    }
    getAvailableFacets(inputInfo) {
        return this.getFacets(inputInfo.mode).filter((v) => v.isAvailable);
    }
    activateFacet(facets, isActive) {
        facets.forEach((v) => (v.isActive = isActive));
        if (!this.settings.quickFilters.shouldResetActiveFacets) {
            this.settings.save();
        }
    }
    getActiveFacetIds(inputInfo) {
        const facetIds = this.getAvailableFacets(inputInfo)
            .filter((v) => v.isActive)
            .map((v) => v.id);
        return new Set(facetIds);
    }
    isFacetedWith(activeFacetIds, facetId) {
        const hasActiveFacets = !!activeFacetIds.size;
        return (hasActiveFacets && activeFacetIds.has(facetId)) || !hasActiveFacets;
    }
    getEditorInfo(leaf) {
        const { excludeViewTypes } = this.settings;
        let file = null;
        let isValidSource = false;
        let cursor = null;
        if (leaf) {
            const { view } = leaf;
            const viewType = view.getViewType();
            file = view.file;
            cursor = this.getCursorPosition(view);
            // determine if the current active editor pane is valid
            const isCurrentEditorValid = !excludeViewTypes.includes(viewType);
            // whether or not the current active editor can be used as the target for
            // symbol search
            isValidSource = isCurrentEditorValid && !!file;
        }
        return { isValidSource, leaf, file, suggestion: null, cursor };
    }
    getSuggestionInfo(suggestion) {
        const info = this.getSourceInfoFromSuggestion(suggestion);
        let leaf = info.leaf;
        if (info.isValidSource) {
            // try to find a matching leaf for suggestion types that don't explicitly
            // provide one. This is primarily needed to be able to focus an
            // existing pane if there is one
            ({ leaf } = this.findMatchingLeaf(info.file, info.leaf));
        }
        // Get the cursor information to support `selectNearestHeading`
        const cursor = this.getCursorPosition(leaf?.view);
        return { ...info, leaf, cursor };
    }
    getSourceInfoFromSuggestion(suggestion) {
        let file = null;
        let leaf = null;
        // Can't use these suggestions as the target for another symbol command,
        // because they don't point to a file
        const invalidTypes = [
            SuggestionType.SymbolList,
            SuggestionType.Unresolved,
            SuggestionType.WorkspaceList,
            SuggestionType.CommandList,
            SuggestionType.VaultList,
        ];
        const isFileBasedSuggestion = suggestion && !invalidTypes.includes(suggestion.type);
        if (isFileBasedSuggestion) {
            file = suggestion.file;
        }
        if (isEditorSuggestion(suggestion)) {
            leaf = suggestion.item;
        }
        const isValidSource = !!file;
        return { isValidSource, leaf, file, suggestion };
    }
    /**
     * Retrieves the position of the cursor, given that view is in a Mode that supports cursors.
     * @param  {View} view
     * @returns EditorPosition
     */
    getCursorPosition(view) {
        let cursor = null;
        if (view?.getViewType() === 'markdown') {
            const md = view;
            if (md.getMode() !== 'preview') {
                const { editor } = md;
                cursor = editor.getCursor('head');
            }
        }
        return cursor;
    }
    /**
     * Returns the text of the first H1 contained in sourceFile, or sourceFile
     * path if an H1 does not exist
     * @param  {TFile} sourceFile
     * @returns string
     */
    getTitleText(sourceFile) {
        const path = stripMDExtensionFromPath(sourceFile);
        const h1 = this.getFirstH1(sourceFile);
        return h1?.heading ?? path;
    }
    /**
     * Finds and returns the first H1 from sourceFile
     * @param  {TFile} sourceFile
     * @returns HeadingCache
     */
    getFirstH1(sourceFile) {
        return Handler.getFirstH1(sourceFile, this.app.metadataCache);
    }
    static getFirstH1(sourceFile, metadataCache) {
        let h1 = null;
        const headingList = metadataCache.getFileCache(sourceFile)?.headings?.filter((v) => v.level === 1) ??
            [];
        if (headingList.length) {
            h1 = headingList.reduce((acc, curr) => {
                const { line: currLine } = curr.position.start;
                const accLine = acc.position.start.line;
                return currLine < accLine ? curr : acc;
            });
        }
        return h1;
    }
    /**
     * Finds the first open WorkspaceLeaf that is showing source file.
     * @param  {TFile} file The source file that is being shown to find
     * @param  {WorkspaceLeaf} leaf An already open editor, or, a 'reference' WorkspaceLeaf (example: backlinks, outline, etc.. views) that is used to find the associated editor if one exists.
     * @param  {} shouldIncludeRefViews=false set to true to make reference view types valid return candidates.
     * @returns TargetInfo
     */
    findMatchingLeaf(file, leaf, shouldIncludeRefViews = false) {
        let matchingLeaf = null;
        const hasSourceLeaf = !!leaf;
        const { settings: { referenceViews, excludeViewTypes, includeSidePanelViewTypes }, } = this;
        const isMatch = (candidateLeaf) => {
            let val = false;
            if (candidateLeaf?.view) {
                const isCandidateRefView = referenceViews.includes(candidateLeaf.view.getViewType());
                const isValidCandidate = shouldIncludeRefViews || !isCandidateRefView;
                const isSourceRefView = hasSourceLeaf && referenceViews.includes(leaf.view.getViewType());
                if (isValidCandidate) {
                    if (hasSourceLeaf && (shouldIncludeRefViews || !isSourceRefView)) {
                        val = candidateLeaf === leaf;
                    }
                    else {
                        val = candidateLeaf.view.file === file;
                    }
                }
            }
            return val;
        };
        // Prioritize the active leaf matches first, otherwise find the first matching leaf
        const activeLeaf = this.getActiveLeaf();
        if (isMatch(activeLeaf)) {
            matchingLeaf = activeLeaf;
        }
        else {
            const leaves = this.getOpenLeaves(excludeViewTypes, includeSidePanelViewTypes);
            // put leaf at the first index so it gets checked first
            matchingLeaf = [leaf, ...leaves].find(isMatch);
        }
        return {
            leaf: matchingLeaf ?? null,
            file,
            suggestion: null,
            isValidSource: false,
        };
    }
    /** Determines if an existing tab should be reused, or create new tab, or create new window based on evt and taking into account user preferences
     * @param  {MouseEvent|KeyboardEvent} evt
     * @param  {boolean} isAlreadyOpen?
     * @param  {Mode} mode? Only Symbol mode has special handling.
     * @returns {navType: boolean | PaneType; splitDirection: SplitDirection}
     */
    extractTabNavigationType(evt, isAlreadyOpen, mode) {
        const splitDirection = evt?.shiftKey ? 'horizontal' : 'vertical';
        const key = evt?.key;
        let navType = obsidian.Keymap.isModEvent(evt) ?? false;
        if (navType === true || navType === 'tab') {
            if (key === 'o') {
                // cmd-o to create new window
                navType = 'window';
            }
            else if (key === '\\') {
                // cmd-\ to create split
                navType = 'split';
            }
        }
        navType = this.applyTabCreationPreferences(navType, isAlreadyOpen, mode);
        return { navType, splitDirection };
    }
    /**
     * Determines whether or not a new leaf should be created taking user
     * settings into account
     * @param  {PaneType | boolean} navType
     * @param  {} isAlreadyOpen=false Set to true if there is a pane showing the file already
     * @param  {Mode} mode? Only Symbol mode has special handling.
     * @returns boolean
     */
    applyTabCreationPreferences(navType, isAlreadyOpen = false, mode) {
        let preferredNavType = navType;
        const { onOpenPreferNewTab, alwaysNewTabForSymbols, useActiveTabForSymbolsOnMobile } = this.settings;
        if (navType === false) {
            if (onOpenPreferNewTab) {
                preferredNavType = !isAlreadyOpen;
            }
            else if (mode === Mode.SymbolList) {
                preferredNavType = obsidian.Platform.isMobile
                    ? !useActiveTabForSymbolsOnMobile
                    : alwaysNewTabForSymbols;
            }
        }
        return preferredNavType;
    }
    /**
     * Determines if a leaf belongs to the main editor panel (workspace.rootSplit or
     * workspace.floatingSplit) as opposed to the side panels
     * @param  {WorkspaceLeaf} leaf
     * @returns boolean
     */
    isMainPanelLeaf(leaf) {
        const { workspace } = this.app;
        const root = leaf?.getRoot();
        return root === workspace.rootSplit || root === workspace.floatingSplit;
    }
    /**
     * Reveals and optionally bring into focus a WorkspaceLeaf, including leaves
     * from the side panels.
     * @param  {WorkspaceLeaf} leaf
     * @param  {Record<string, unknown>} eState?
     * @returns void
     */
    activateLeaf(leaf, eState) {
        const { workspace } = this.app;
        const isInSidePanel = !this.isMainPanelLeaf(leaf);
        const state = { focus: true, ...eState };
        if (isInSidePanel) {
            workspace.revealLeaf(leaf);
        }
        workspace.setActiveLeaf(leaf, { focus: true });
        leaf.view.setEphemeralState(state);
    }
    /**
     * Returns a array of all open WorkspaceLeaf taking into account
     * excludeMainPanelViewTypes and includeSidePanelViewTypes.
     * @param  {string[]} excludeMainPanelViewTypes?
     * @param  {string[]} includeSidePanelViewTypes?
     * @returns WorkspaceLeaf[]
     */
    getOpenLeaves(excludeMainPanelViewTypes, includeSidePanelViewTypes, options) {
        const leaves = [];
        const saveLeaf = (l) => {
            const viewType = l?.view?.getViewType();
            if (this.isMainPanelLeaf(l)) {
                if (!excludeMainPanelViewTypes?.includes(viewType)) {
                    leaves.push(l);
                }
            }
            else if (includeSidePanelViewTypes?.includes(viewType)) {
                leaves.push(l);
            }
        };
        this.app.workspace.iterateAllLeaves(saveLeaf);
        if (options?.orderByAccessTime) {
            leaves.sort((a, b) => {
                const t1 = a?.activeTime ?? 0;
                const t2 = b?.activeTime ?? 0;
                return t2 - t1;
            });
        }
        return leaves;
    }
    /**
     * Loads a file into a WorkspaceLeaf based on navType
     * @param  {TFile} file
     * @param  {PaneType|boolean} navType
     * @param  {OpenViewState} openState?
     * @param  {SplitDirection} splitDirection if navType is 'split', the direction to
     * open the split. Defaults to 'vertical'
     * @returns void
     */
    async openFileInLeaf(file, navType, openState, splitDirection = 'vertical') {
        const { workspace } = this.app;
        const leaf = navType === 'split'
            ? workspace.getLeaf(navType, splitDirection)
            : workspace.getLeaf(navType);
        await leaf.openFile(file, openState);
    }
    /**
     * Determines whether to activate (make active and focused) an existing WorkspaceLeaf
     * (searches through all leaves), or create a new WorkspaceLeaf, or reuse an unpinned
     * WorkspaceLeaf, or create a new window in order to display file. This takes user
     * settings and event status into account.
     * @param  {MouseEvent|KeyboardEvent} evt navigation trigger event
     * @param  {TFile} file The file to display
     * @param  {string} errorContext Custom text to save in error messages
     * @param  {OpenViewState} openState? State to pass to the new, or activated view. If
     * falsy, default values will be used
     * @param  {WorkspaceLeaf} leaf? WorkspaceLeaf, or reference WorkspaceLeaf
     * (backlink, outline, etc..) to activate if it's already known
     * @param  {Mode} mode? Only Symbol mode has custom handling
     * @param  {boolean} shouldIncludeRefViews whether reference WorkspaceLeaves are valid
     * targets for activation
     * @returns void
     */
    navigateToLeafOrOpenFile(evt, file, errorContext, openState, leaf, mode, shouldIncludeRefViews = false) {
        this.navigateToLeafOrOpenFileAsync(evt, file, openState, leaf, mode, shouldIncludeRefViews).catch((reason) => {
            console.log(`Switcher++: error navigating to open file. ${errorContext}`, reason);
        });
    }
    /**
     * Determines whether to activate (make active and focused) an existing WorkspaceLeaf
     * (searches through all leaves), or create a new WorkspaceLeaf, or reuse an unpinned
     * WorkspaceLeaf, or create a new window in order to display file. This takes user
     * settings and event status into account.
     * @param  {MouseEvent|KeyboardEvent} evt navigation trigger event
     * @param  {TFile} file The file to display
     * @param  {OpenViewState} openState? State to pass to the new, or activated view. If
     * falsy, default values will be used
     * @param  {WorkspaceLeaf} leaf? WorkspaceLeaf, or reference WorkspaceLeaf
     * (backlink, outline, etc..) to activate if it's already known
     * @param  {Mode} mode? Only Symbol mode has custom handling
     * @param  {boolean} shouldIncludeRefViews whether reference WorkspaceLeaves are valid
     * targets for activation
     * @returns void
     */
    async navigateToLeafOrOpenFileAsync(evt, file, openState, leaf, mode, shouldIncludeRefViews = false) {
        const { leaf: targetLeaf } = this.findMatchingLeaf(file, leaf, shouldIncludeRefViews);
        const isAlreadyOpen = !!targetLeaf;
        const { navType, splitDirection } = this.extractTabNavigationType(evt, isAlreadyOpen, mode);
        await this.activateLeafOrOpenFile(navType, file, targetLeaf, openState, splitDirection);
    }
    /**
     * Activates leaf (if provided), or load file into another leaf based on navType
     * @param  {PaneType|boolean} navType
     * @param  {TFile} file
     * @param  {WorkspaceLeaf} leaf? optional if supplied and navType is
     * false then leaf will be activated
     * @param  {OpenViewState} openState?
     * @param  {SplitDirection} splitDirection? if navType is 'split', the direction to
     * open the split
     * @returns void
     */
    async activateLeafOrOpenFile(navType, file, leaf, openState, splitDirection) {
        // default to having the pane active and focused
        openState = openState ?? { active: true, eState: { active: true, focus: true } };
        if (leaf && navType === false) {
            const eState = openState?.eState;
            this.activateLeaf(leaf, eState);
        }
        else {
            await this.openFileInLeaf(file, navType, openState, splitDirection);
        }
    }
    /**
     * Renders the UI elements to display path information for file using the
     * stored configuration settings
     * @param  {HTMLElement} parentEl containing element, this should be the element with
     * the "suggestion-content" style
     * @param  {TFile} file
     * @param  {boolean} excludeOptionalFilename? set to true to hide the filename in cases
     * where when {PathDisplayFormat} is set to FolderPathFilenameOptional
     * @param  {SearchResult} match?
     * @param  {boolean} overridePathFormat? set to true force display the path and set
     * {PathDisplayFormat} to FolderPathFilenameOptional
     * @returns void
     */
    renderPath(parentEl, file, excludeOptionalFilename, match, overridePathFormat) {
        if (parentEl && file) {
            const isRoot = file.parent.isRoot();
            let format = this.settings.pathDisplayFormat;
            let hidePath = format === PathDisplayFormat.None || (isRoot && this.settings.hidePathIfRoot);
            if (overridePathFormat) {
                format = PathDisplayFormat.FolderPathFilenameOptional;
                hidePath = false;
            }
            if (!hidePath) {
                const wrapperEl = parentEl.createDiv({ cls: ['suggestion-note', 'qsp-note'] });
                const path = this.getPathDisplayText(file, format, excludeOptionalFilename);
                const iconEl = wrapperEl.createSpan({ cls: ['qsp-path-indicator'] });
                obsidian.setIcon(iconEl, 'folder');
                const pathEl = wrapperEl.createSpan({ cls: 'qsp-path' });
                obsidian.renderResults(pathEl, path, match);
            }
        }
    }
    /**
     * Formats the path of file based on displayFormat
     * @param  {TFile} file
     * @param  {PathDisplayFormat} displayFormat
     * @param  {boolean} excludeOptionalFilename? Only applicable to
     * {PathDisplayFormat.FolderPathFilenameOptional}. When true will exclude the filename from the returned string
     * @returns string
     */
    getPathDisplayText(file, displayFormat, excludeOptionalFilename) {
        let text = '';
        if (file) {
            const { parent } = file;
            const dirname = parent.name;
            const isRoot = parent.isRoot();
            // root path is expected to always be "/"
            const rootPath = this.app.vault.getRoot().path;
            switch (displayFormat) {
                case PathDisplayFormat.FolderWithFilename:
                    text = isRoot ? `${file.name}` : obsidian.normalizePath(`${dirname}/${file.name}`);
                    break;
                case PathDisplayFormat.FolderOnly:
                    text = isRoot ? rootPath : dirname;
                    break;
                case PathDisplayFormat.Full:
                    text = file.path;
                    break;
                case PathDisplayFormat.FolderPathFilenameOptional:
                    if (excludeOptionalFilename) {
                        text = parent.path;
                        if (!isRoot) {
                            text += rootPath; // add explicit trailing /
                        }
                    }
                    else {
                        text = this.getPathDisplayText(file, PathDisplayFormat.Full);
                    }
                    break;
            }
        }
        return text;
    }
    /**
     * Creates the UI elements to display the primary suggestion text using
     * the correct styles.
     * @param  {HTMLElement} parentEl containing element, this should be the element with
     * the "suggestion-item" style
     * @param  {string} content
     * @param  {SearchResult} match
     * @param  {number} offset?
     * @returns HTMLDivElement
     */
    renderContent(parentEl, content, match, offset) {
        const contentEl = parentEl.createDiv({
            cls: ['suggestion-content', 'qsp-content'],
        });
        const titleEl = contentEl.createDiv({
            cls: ['suggestion-title', 'qsp-title'],
        });
        obsidian.renderResults(titleEl, content, match, offset);
        return contentEl;
    }
    /** add the base suggestion styles to the suggestion container element
     * @param  {HTMLElement} parentEl container element
     * @param  {string[]} additionalStyles? optional styles to add
     */
    addClassesToSuggestionContainer(parentEl, additionalStyles) {
        const styles = ['mod-complex'];
        if (additionalStyles) {
            styles.push(...additionalStyles);
        }
        parentEl?.addClasses(styles);
    }
    /**
     * Searches through primaryString, if not match is found,
     * searches through secondaryString
     * @param  {PreparedQuery} prepQuery
     * @param  {string} primaryString
     * @param  {string} secondaryString?
     * @returns { isPrimary: boolean; match?: SearchResult }
     */
    fuzzySearchStrings(prepQuery, primaryString, secondaryString) {
        let isPrimary = false;
        let match = null;
        if (primaryString) {
            match = obsidian.fuzzySearch(prepQuery, primaryString);
            isPrimary = !!match;
        }
        if (!match && secondaryString) {
            match = obsidian.fuzzySearch(prepQuery, secondaryString);
            if (match) {
                match.score -= 1;
            }
        }
        return {
            isPrimary,
            match,
        };
    }
    /**
     * Searches through primaryText, if no match is found and file is not null, it will
     * fallback to searching 1) file.basename, 2) file.path
     * @param  {PreparedQuery} prepQuery
     * @param  {string} primaryString
     * @param  {PathSegments} pathSegments? TFile like object containing the basename and full path.
     * @returns SearchResultWithFallback
     */
    fuzzySearchWithFallback(prepQuery, primaryString, pathSegments) {
        let matchType = MatchType.None;
        let matchText;
        let match = null;
        let res = this.fuzzySearchStrings(prepQuery, primaryString);
        if (res.match) {
            match = res.match;
            matchType = MatchType.Primary;
            matchText = primaryString;
        }
        else if (pathSegments) {
            const { basename, path } = pathSegments;
            // Note: the fallback to path has to search through the entire path
            // because search needs to match over the filename/basename boundaries
            // e.g. search string "to my" should match "path/to/myfile.md"
            // that means MatchType.Basename will always be in the basename, while
            // MatchType.ParentPath can span both filename and basename
            res = this.fuzzySearchStrings(prepQuery, basename, path);
            if (res.isPrimary) {
                matchType = MatchType.Basename;
                matchText = basename;
            }
            else if (res.match) {
                matchType = MatchType.Path;
                matchText = path;
            }
            match = res.match;
        }
        return { matchType, matchText, match };
    }
    /**
     * Separate match into two groups, one that only matches the path segment of file, and
     * a second that only matches the filename segment
     * @param  {PathSegments} pathSegments
     * @param  {SearchResult} match
     * @returns {SearchResult; SearchResult}
     */
    splitSearchMatchesAtBasename(pathSegments, match) {
        let basenameMatch = null;
        let pathMatch = null;
        // function to re-anchor offsets by a certain amount
        const decrementOffsets = (offsets, amount) => {
            offsets.forEach((offset) => {
                offset[0] -= amount;
                offset[1] -= amount;
            });
        };
        if (pathSegments && match?.matches) {
            const nameIndex = pathSegments.path.lastIndexOf(pathSegments.basename);
            if (nameIndex >= 0) {
                const { matches, score } = match;
                const matchStartIndex = matches[0][0];
                const matchEndIndex = matches[matches.length - 1][1];
                if (matchStartIndex >= nameIndex) {
                    // the entire match offset is in the basename segment, so match can be used
                    // for basename
                    basenameMatch = match;
                    decrementOffsets(basenameMatch.matches, nameIndex);
                }
                else if (matchEndIndex <= nameIndex) {
                    // the entire match offset is in the path segment
                    pathMatch = match;
                }
                else {
                    // the match offset spans both path and basename, so they will have to
                    // to be split up. Note that the entire SearchResult can span both, and
                    // a single SearchMatchPart inside the SearchResult can also span both
                    let i = matches.length;
                    while (i--) {
                        const matchPartStartIndex = matches[i][0];
                        const matchPartEndIndex = matches[i][1];
                        const nextMatchPartIndex = i + 1;
                        if (matchPartEndIndex <= nameIndex) {
                            // the last path segment MatchPart ends cleanly in the path segment
                            pathMatch = { score, matches: matches.slice(0, nextMatchPartIndex) };
                            basenameMatch = { score, matches: matches.slice(nextMatchPartIndex) };
                            decrementOffsets(basenameMatch.matches, nameIndex);
                            break;
                        }
                        else if (matchPartStartIndex < nameIndex) {
                            // the last MatchPart starts in path segment and ends in basename segment
                            // adjust the end of the path segment MatchPart to finish at the end
                            // of the path segment
                            let offsets = matches.slice(0, nextMatchPartIndex);
                            offsets[offsets.length - 1] = [matchPartStartIndex, nameIndex];
                            pathMatch = { score, matches: offsets };
                            // adjust the beginning of the first basename segment MatchPart to start
                            // at the beginning of the basename segment
                            offsets = matches.slice(i);
                            decrementOffsets(offsets, nameIndex);
                            offsets[0][0] = 0;
                            basenameMatch = { score, matches: offsets };
                            break;
                        }
                    }
                }
            }
        }
        return { pathMatch, basenameMatch };
    }
    /**
     * Display the provided information as a suggestion with the content and path information on separate lines
     * @param  {HTMLElement} parentEl
     * @param  {string[]} parentElStyles
     * @param  {string} primaryString
     * @param  {TFile} file
     * @param  {MatchType} matchType
     * @param  {SearchResult} match
     * @param  {} excludeOptionalFilename=true
     * @returns void
     */
    renderAsFileInfoPanel(parentEl, parentElStyles, primaryString, file, matchType, match, excludeOptionalFilename = true) {
        let primaryMatch = null;
        let pathMatch = null;
        if (primaryString?.length) {
            if (matchType === MatchType.Primary) {
                primaryMatch = match;
            }
            else if (matchType === MatchType.Path) {
                pathMatch = match;
            }
        }
        else if (file) {
            primaryString = file.basename;
            if (matchType === MatchType.Basename) {
                primaryMatch = match;
            }
            else if (matchType === MatchType.Path) {
                // MatchType.ParentPath can span both filename and basename
                // (partial match in each) so try to split the match offsets
                ({ pathMatch, basenameMatch: primaryMatch } = this.splitSearchMatchesAtBasename(file, match));
            }
        }
        this.addClassesToSuggestionContainer(parentEl, parentElStyles);
        const contentEl = this.renderContent(parentEl, primaryString, primaryMatch);
        this.renderPath(contentEl, file, excludeOptionalFilename, pathMatch, !!pathMatch);
    }
    /**
     * Returns the currently active leaf across all root workspace splits
     * @returns WorkspaceLeaf | null
     */
    getActiveLeaf() {
        return Handler.getActiveLeaf(this.app.workspace);
    }
    /**
     * Returns the currently active leaf across all root workspace splits
     * @param  {Workspace} workspace
     * @returns WorkspaceLeaf | null
     */
    static getActiveLeaf(workspace) {
        const leaf = workspace?.getActiveViewOfType(obsidian.View)?.leaf;
        return leaf ?? null;
    }
    /**
     * Displays extra flair icons for an item, and adds any associated css classes
     * to parentEl
     * @param  {HTMLElement} parentEl the suggestion container element
     * @param  {AnySuggestion} sugg the suggestion item
     * @param  {HTMLDivElement=null} flairContainerEl optional, if null, it will be created
     * @returns HTMLDivElement the flairContainerEl that was passed in or created
     */
    renderOptionalIndicators(parentEl, sugg, flairContainerEl = null) {
        const { showOptionalIndicatorIcons } = this.settings;
        const indicatorData = new Map();
        indicatorData.set('isRecent', {
            iconName: 'history',
            parentElClass: 'qsp-recent-file',
            indicatorElClass: 'qsp-recent-indicator',
        });
        indicatorData.set('isOpenInEditor', {
            iconName: 'lucide-file-edit',
            parentElClass: 'qsp-open-editor',
            indicatorElClass: 'qsp-editor-indicator',
        });
        indicatorData.set('isBookmarked', {
            iconName: 'lucide-bookmark',
            parentElClass: 'qsp-bookmarked-file',
            indicatorElClass: 'qsp-bookmarked-indicator',
        });
        if (!flairContainerEl) {
            flairContainerEl = this.createFlairContainer(parentEl);
        }
        if (showOptionalIndicatorIcons) {
            for (const [state, data] of indicatorData.entries()) {
                if (sugg[state] === true) {
                    if (data.parentElClass) {
                        parentEl?.addClass(data.parentElClass);
                    }
                    this.renderIndicator(flairContainerEl, [data.indicatorElClass], data.iconName);
                }
            }
        }
        return flairContainerEl;
    }
    /**
     * @param  {HTMLDivElement} flairContainerEl
     * @param  {string[]} indicatorClasses additional css classes to add to flair element
     * @param  {string} svgIconName? the name of the svg icon to use
     * @param  {string} indicatorText? the text content of the flair element
     * @returns HTMLElement the flair icon wrapper element
     */
    renderIndicator(flairContainerEl, indicatorClasses, svgIconName, indicatorText) {
        const cls = ['suggestion-flair', ...indicatorClasses];
        const flairEl = flairContainerEl?.createSpan({ cls });
        if (flairEl) {
            if (svgIconName) {
                flairEl.addClass('svg-icon');
                obsidian.setIcon(flairEl, svgIconName);
            }
            if (indicatorText) {
                flairEl.setText(indicatorText);
            }
        }
        return flairEl;
    }
    /**
     * Creates a child Div element with the appropriate css classes for flair icons
     * @param  {HTMLElement} parentEl
     * @returns HTMLDivElement
     */
    createFlairContainer(parentEl) {
        return parentEl?.createDiv({ cls: ['suggestion-aux', 'qsp-aux'] });
    }
    /**
     * Retrieves a TFile object using path. Return null if path does not represent
     * a TFile object.
     * @param  {string} path
     * @returns TFile|null
     */
    getTFileByPath(path) {
        return getTFileByPath(path, this.app.vault);
    }
    /**
     * Downranks suggestions for files that live in Obsidian ignored paths, or,
     * increases the suggestion score by a factor specified in settings. This instance
     * version just forwards to the static version
     * @param  {V} sugg the suggestion objects
     * @returns V
     */
    applyMatchPriorityPreferences(sugg) {
        return Handler.applyMatchPriorityPreferences(sugg, this.settings, this.app.metadataCache);
    }
    /**
     * Downranks suggestions for files that live in Obsidian ignored paths, or,
     * increases the suggestion score by a factor specified in settings.
     * @param  {V} sugg the suggestion objects
     * @param  {SwitcherPlusSettings} settings
     * @param  {MetadataCache} metadataCache
     * @returns V
     */
    static applyMatchPriorityPreferences(sugg, settings, metadataCache) {
        if (sugg?.match) {
            const { match, type, file } = sugg;
            if (file && metadataCache?.isUserIgnored(file.path)) {
                // downrank suggestions that are in an obsidian ignored paths
                sugg.downranked = true;
                sugg.match.score -= 10;
            }
            else if (settings?.matchPriorityAdjustments?.isEnabled) {
                const { matchPriorityAdjustments } = settings;
                const adjustments = matchPriorityAdjustments.adjustments ?? {};
                const fileExtAdjustments = matchPriorityAdjustments.fileExtAdjustments ?? {};
                let factor = 0;
                const getFactor = (key, collection) => {
                    collection = collection ?? adjustments;
                    let val = 0;
                    if (Object.prototype.hasOwnProperty.call(collection, key)) {
                        val = Number(collection[key]?.value);
                    }
                    return isNaN(val) ? 0 : val;
                };
                const getFactorConstrained = (searchType, searchKey) => {
                    let val = 0;
                    if ((searchType !== null && searchType === type) || sugg[searchKey]) {
                        val = getFactor(searchKey);
                    }
                    return val;
                };
                factor += getFactorConstrained(SuggestionType.Bookmark, 'isBookmarked');
                factor += getFactorConstrained(SuggestionType.EditorList, 'isOpenInEditor');
                factor += getFactorConstrained(null, 'isRecent');
                factor += getFactorConstrained(null, 'isAttachment');
                factor += getFactor(file?.extension, fileExtAdjustments);
                if (isHeadingSuggestion(sugg)) {
                    factor += getFactor(`h${sugg.item?.level}`);
                }
                // check for adjustments defined for other suggestion types, the types that are
                // explicitly checked above should not be in the adjustment list so
                // they don't get counted twice (above and then again here)
                const typeStr = type.toString();
                factor += getFactor(typeStr);
                // update score by the percentage define by factor
                // find one percent of score by dividing the absolute value of score by 100,
                // multiply factor by 100 to convert into percentage
                // multiply the two to get the change amount, and add it to score
                match.score += (Math.abs(match.score) / 100) * (factor * 100);
            }
        }
        return sugg;
    }
    /**
     * Sets isOpenInEditor, isRecent, isBookmarked, isAttachment, status of sugg
     * based on currentWorkspaceEnvList
     * @param  {WorkspaceEnvList} currentWorkspaceEnvList
     * @param  {V} sugg
     * @returns V
     */
    static updateWorkspaceEnvListStatus(currentWorkspaceEnvList, sugg) {
        if (currentWorkspaceEnvList && sugg?.file) {
            const { file } = sugg;
            sugg.isOpenInEditor = currentWorkspaceEnvList.openWorkspaceFiles?.has(file);
            sugg.isRecent = currentWorkspaceEnvList.mostRecentFiles?.has(file);
            sugg.isBookmarked = currentWorkspaceEnvList.fileBookmarks?.has(file);
            sugg.isAttachment = currentWorkspaceEnvList.attachmentFileExtensions?.has(file.extension);
        }
        return sugg;
    }
    /**
     * Renders a suggestion hint for creating a new note
     * @param  {HTMLElement} parentEl
     * @param  {string} filename
     * @returns HTMLDivElement
     */
    renderFileCreationSuggestion(parentEl, filename) {
        this.addClassesToSuggestionContainer(parentEl);
        const contentEl = this.renderContent(parentEl, filename, null);
        const flairEl = this.createFlairContainer(parentEl);
        flairEl?.createSpan({
            cls: 'suggestion-hotkey',
            text: 'Enter to create',
        });
        return contentEl;
    }
    /**
     * Creates a new note in the vault with filename. Uses evt to determine the
     * navigation type (reuse tab, new tab, new window) to use for opening the newly
     * created note.
     * @param  {string} filename
     * @param  {MouseEvent|KeyboardEvent} evt
     * @returns void
     */
    createFile(filename, evt) {
        const { workspace } = this.app;
        const { navType } = this.extractTabNavigationType(evt);
        const activeView = workspace.getActiveViewOfType(obsidian.FileView);
        let sourcePath = '';
        if (activeView?.file) {
            sourcePath = activeView.file.path;
        }
        workspace
            .openLinkText(filename, sourcePath, navType, { active: true })
            .catch((err) => {
            console.log('Switcher++: error creating new file. ', err);
        });
    }
}

const WORKSPACE_PLUGIN_ID = 'workspaces';
class WorkspaceHandler extends Handler {
    getCommandString(_sessionOpts) {
        return this.settings?.workspaceListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        const cmd = inputInfo.parsedCommand(Mode.WorkspaceList);
        if (this.getEnabledWorkspacesPluginInstance()) {
            inputInfo.mode = Mode.WorkspaceList;
            cmd.index = index;
            cmd.parsedInput = filterText;
            cmd.isValidated = true;
        }
        return cmd;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const items = this.getItems();
            items.forEach((item) => {
                let shouldPush = true;
                let match = null;
                if (hasSearchTerm) {
                    match = obsidian.fuzzySearch(prepQuery, item.id);
                    shouldPush = !!match;
                }
                if (shouldPush) {
                    suggestions.push({ type: SuggestionType.WorkspaceList, item, match });
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            this.addClassesToSuggestionContainer(parentEl, ['qsp-suggestion-workspace']);
            this.renderContent(parentEl, sugg.item.id, sugg.match);
            handled = true;
        }
        return handled;
    }
    onChooseSuggestion(sugg, _evt) {
        let handled = false;
        if (sugg) {
            const { id } = sugg.item;
            const pluginInstance = this.getEnabledWorkspacesPluginInstance();
            if (pluginInstance) {
                pluginInstance.loadWorkspace(id);
            }
            handled = true;
        }
        return handled;
    }
    onNoResultsCreateAction(inputInfo, _evt) {
        const pluginInstance = this.getEnabledWorkspacesPluginInstance();
        if (pluginInstance) {
            const input = inputInfo.parsedCommand(Mode.WorkspaceList)?.parsedInput;
            // create a new workspace and set it active
            pluginInstance.saveWorkspace(input);
            pluginInstance.setActiveWorkspace(input);
        }
        return true;
    }
    getItems() {
        const items = [];
        const workspaces = this.getEnabledWorkspacesPluginInstance()?.workspaces;
        if (workspaces) {
            Object.keys(workspaces).forEach((id) => items.push({ id, type: 'workspaceInfo' }));
        }
        return items.sort((a, b) => a.id.localeCompare(b.id));
    }
    getEnabledWorkspacesPluginInstance() {
        return getInternalEnabledPluginById(this.app, WORKSPACE_PLUGIN_ID);
    }
}

class StandardExHandler extends Handler {
    getCommandString(_sessionOpts) {
        return '';
    }
    validateCommand(_inputInfo, _index, _filterText, _activeSuggestion, _activeLeaf) {
        throw new Error('Method not implemented.');
    }
    getSuggestions(_inputInfo) {
        throw new Error('Method not implemented.');
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (isFileSuggestion(sugg)) {
            handled = this.renderFileSuggestion(sugg, parentEl);
        }
        else {
            handled = this.renderAliasSuggestion(sugg, parentEl);
        }
        if (sugg?.downranked) {
            parentEl.addClass('mod-downranked');
        }
        return handled;
    }
    onChooseSuggestion(sugg, evt) {
        let handled = false;
        if (sugg) {
            const { file } = sugg;
            this.navigateToLeafOrOpenFile(evt, file, `Unable to open file from SystemSuggestion ${file.path}`);
            handled = true;
        }
        return handled;
    }
    renderFileSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { file, matchType, match } = sugg;
            this.renderAsFileInfoPanel(parentEl, ['qsp-suggestion-file'], null, file, matchType, match);
            this.renderOptionalIndicators(parentEl, sugg);
            handled = true;
        }
        return handled;
    }
    renderAliasSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { file, matchType, match } = sugg;
            this.renderAsFileInfoPanel(parentEl, ['qsp-suggestion-alias'], sugg.alias, file, matchType, match, false);
            const flairContainerEl = this.renderOptionalIndicators(parentEl, sugg);
            this.renderIndicator(flairContainerEl, ['qsp-alias-indicator'], 'lucide-forward');
            handled = true;
        }
        return handled;
    }
    addPropertiesToStandardSuggestions(inputInfo, sugg) {
        const { match, file } = sugg;
        const matches = match?.matches;
        let matchType = MatchType.None;
        let matchText = null;
        if (matches) {
            if (isAliasSuggestion(sugg)) {
                matchType = MatchType.Primary;
                matchText = sugg.alias;
            }
            else {
                matchType = MatchType.Path;
                matchText = file?.path;
            }
        }
        sugg.matchType = matchType;
        sugg.matchText = matchText;
        // patch with missing properties required for enhanced custom rendering
        Handler.updateWorkspaceEnvListStatus(inputInfo.currentWorkspaceEnvList, sugg);
    }
    static createUnresolvedSuggestion(linktext, result, settings, metadataCache) {
        const sugg = {
            linktext,
            type: SuggestionType.Unresolved,
            ...result,
        };
        return Handler.applyMatchPriorityPreferences(sugg, settings, metadataCache);
    }
}

class EditorHandler extends Handler {
    getCommandString(_sessionOpts) {
        return this.settings?.editorListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        inputInfo.mode = Mode.EditorList;
        const cmd = inputInfo.parsedCommand(Mode.EditorList);
        cmd.index = index;
        cmd.parsedInput = filterText;
        cmd.isValidated = true;
        return cmd;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const items = this.getItems();
            items.forEach((item) => {
                const file = item.view?.file;
                let shouldPush = true;
                let result = { matchType: MatchType.None, match: null };
                const preferredTitle = this.getPreferredTitle(item, this.settings.preferredSourceForTitle);
                if (hasSearchTerm) {
                    result = this.fuzzySearchWithFallback(prepQuery, preferredTitle, file);
                    shouldPush = result.matchType !== MatchType.None;
                }
                if (shouldPush) {
                    suggestions.push(this.createSuggestion(inputInfo.currentWorkspaceEnvList, item, file, result, preferredTitle));
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    getPreferredTitle(leaf, titleSource) {
        return EditorHandler.getPreferredTitle(leaf, titleSource, this.app.metadataCache);
    }
    static getPreferredTitle(leaf, titleSource, metadataCache) {
        const { view } = leaf;
        const file = view?.file;
        let text = leaf.getDisplayText();
        if (titleSource === 'H1' && file) {
            const h1 = EditorHandler.getFirstH1(file, metadataCache);
            if (h1) {
                text = text.replace(file.basename, h1.heading);
            }
        }
        return text;
    }
    getItems() {
        const { excludeViewTypes, includeSidePanelViewTypes, orderEditorListByAccessTime: orderByAccessTime, } = this.settings;
        return this.getOpenLeaves(excludeViewTypes, includeSidePanelViewTypes, {
            orderByAccessTime,
        });
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { file, matchType, match } = sugg;
            const hideBasename = [MatchType.None, MatchType.Primary].includes(matchType);
            this.renderAsFileInfoPanel(parentEl, ['qsp-suggestion-editor'], sugg.preferredTitle, file, matchType, match, hideBasename);
            this.renderOptionalIndicators(parentEl, sugg);
            handled = true;
        }
        return handled;
    }
    onChooseSuggestion(sugg, evt) {
        let handled = false;
        if (sugg) {
            this.navigateToLeafOrOpenFile(evt, sugg.file, 'Unable to reopen existing editor in new Leaf.', null, sugg.item, null, true);
            handled = true;
        }
        return handled;
    }
    createSuggestion(currentWorkspaceEnvList, leaf, file, result, preferredTitle) {
        return EditorHandler.createSuggestion(currentWorkspaceEnvList, leaf, file, this.settings, this.app.metadataCache, preferredTitle, result);
    }
    static createSuggestion(currentWorkspaceEnvList, leaf, file, settings, metadataCache, preferredTitle, result) {
        result = result ?? { matchType: MatchType.None, match: null, matchText: null };
        preferredTitle = preferredTitle ?? null;
        let sugg = {
            item: leaf,
            file,
            preferredTitle,
            type: SuggestionType.EditorList,
            ...result,
        };
        sugg = Handler.updateWorkspaceEnvListStatus(currentWorkspaceEnvList, sugg);
        return Handler.applyMatchPriorityPreferences(sugg, settings, metadataCache);
    }
}

const BOOKMARKS_PLUGIN_ID = 'bookmarks';
class BookmarksHandler extends Handler {
    getCommandString(_sessionOpts) {
        return this.settings?.bookmarksListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        const cmd = inputInfo.parsedCommand(Mode.BookmarksList);
        if (this.getEnabledBookmarksPluginInstance()) {
            inputInfo.mode = Mode.BookmarksList;
            cmd.index = index;
            cmd.parsedInput = filterText;
            cmd.isValidated = true;
        }
        return cmd;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const { allBookmarks } = this.getItems(inputInfo);
            allBookmarks.forEach((info) => {
                let shouldPush = true;
                let result = { matchType: MatchType.None, match: null };
                if (hasSearchTerm) {
                    result = this.fuzzySearchWithFallback(prepQuery, info.bookmarkPath);
                    shouldPush = result.matchType !== MatchType.None;
                }
                if (shouldPush) {
                    suggestions.push(this.createSuggestion(inputInfo.currentWorkspaceEnvList, info, result));
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(_sugg, _parentEl) {
        return false;
    }
    onChooseSuggestion(_sugg, _evt) {
        return false;
    }
    getPreferredTitle(pluginInstance, bookmark, file, titleSource) {
        let text = pluginInstance.getItemTitle(bookmark);
        if (titleSource === 'H1' && file) {
            const h1 = this.getFirstH1(file);
            if (h1) {
                // the "#" represents the start of a heading deep link,
                // "#^" represents the the start of a deep block link,
                // so everything before "#" should represent the filename that
                // needs to be replaced with the file title
                text = text.replace(/^[^#]*/, h1.heading);
            }
        }
        return text;
    }
    getItems(inputInfo) {
        const allBookmarks = [];
        const fileBookmarks = new Map();
        const nonFileBookmarks = new Set();
        const pluginInstance = this.getEnabledBookmarksPluginInstance();
        if (pluginInstance) {
            // if inputInfo is not supplied, then all items are expected (disregard facets), so use
            // and empty facet list
            const activeFacetIds = inputInfo
                ? this.getActiveFacetIds(inputInfo)
                : new Set();
            const traverseBookmarks = (bookmarks, path) => {
                bookmarks?.forEach((bookmark) => {
                    if (BookmarksHandler.isBookmarksPluginGroupItem(bookmark)) {
                        traverseBookmarks(bookmark.items, `${path}${bookmark.title}/`);
                    }
                    else if (this.isFacetedWith(activeFacetIds, BOOKMARKS_FACET_ID_MAP[bookmark.type])) {
                        const bookmarkInfo = {
                            item: bookmark,
                            bookmarkPath: null,
                            file: null,
                        };
                        if (BookmarksHandler.isBookmarksPluginFileItem(bookmark)) {
                            const file = this.getTFileByPath(bookmark.path);
                            if (file) {
                                bookmarkInfo.file = file;
                                const infoList = fileBookmarks.get(file) ?? [];
                                infoList.push(bookmarkInfo);
                                fileBookmarks.set(file, infoList);
                            }
                        }
                        else {
                            nonFileBookmarks.add(bookmarkInfo);
                        }
                        const title = this.getPreferredTitle(pluginInstance, bookmark, bookmarkInfo.file, this.settings.preferredSourceForTitle);
                        bookmarkInfo.bookmarkPath = path + title;
                        allBookmarks.push(bookmarkInfo);
                    }
                });
            };
            traverseBookmarks(pluginInstance.items, '');
        }
        return { allBookmarks, fileBookmarks, nonFileBookmarks };
    }
    getEnabledBookmarksPluginInstance() {
        return getInternalEnabledPluginById(this.app, BOOKMARKS_PLUGIN_ID);
    }
    createSuggestion(currentWorkspaceEnvList, bookmarkInfo, result) {
        return BookmarksHandler.createSuggestion(currentWorkspaceEnvList, bookmarkInfo, this.settings, this.app.metadataCache, result);
    }
    static createSuggestion(currentWorkspaceEnvList, bookmarkInfo, settings, metadataCache, result) {
        let sugg = {
            type: SuggestionType.Bookmark,
            item: bookmarkInfo.item,
            bookmarkPath: bookmarkInfo.bookmarkPath,
            file: bookmarkInfo.file,
            ...result,
        };
        sugg = Handler.updateWorkspaceEnvListStatus(currentWorkspaceEnvList, sugg);
        return Handler.applyMatchPriorityPreferences(sugg, settings, metadataCache);
    }
    static isBookmarksPluginFileItem(obj) {
        return isOfType(obj, 'type', 'file');
    }
    static isBookmarksPluginGroupItem(obj) {
        return isOfType(obj, 'type', 'group');
    }
}

class HeadingsHandler extends Handler {
    getCommandString(_sessionOpts) {
        return this.settings?.headingsListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        inputInfo.mode = Mode.HeadingsList;
        const cmd = inputInfo.parsedCommand(Mode.HeadingsList);
        cmd.index = index;
        cmd.parsedInput = filterText;
        cmd.isValidated = true;
        return cmd;
    }
    onChooseSuggestion(sugg, evt) {
        let handled = false;
        if (sugg) {
            const { start: { line, col }, end: endLoc, } = sugg.item.position;
            // state information to highlight the target heading
            const eState = {
                active: true,
                focus: true,
                startLoc: { line, col },
                endLoc,
                line,
                cursor: {
                    from: { line, ch: col },
                    to: { line, ch: col },
                },
            };
            this.navigateToLeafOrOpenFile(evt, sugg.file, 'Unable to navigate to heading for file.', { active: true, eState });
            handled = true;
        }
        return handled;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { item } = sugg;
            this.addClassesToSuggestionContainer(parentEl, [
                'qsp-suggestion-headings',
                `qsp-headings-l${item.level}`,
            ]);
            const contentEl = this.renderContent(parentEl, item.heading, sugg.match);
            this.renderPath(contentEl, sugg.file);
            // render the flair icons
            const flairContainerEl = this.createFlairContainer(parentEl);
            this.renderOptionalIndicators(parentEl, sugg, flairContainerEl);
            this.renderIndicator(flairContainerEl, ['qsp-headings-indicator'], null, HeadingIndicators[item.level]);
            if (sugg.downranked) {
                parentEl.addClass('mod-downranked');
            }
            handled = true;
        }
        return handled;
    }
    getAvailableFacets(inputInfo) {
        const { settings: { shouldSearchHeadings, shouldSearchBookmarks, shouldSearchFilenames, shouldSearchRecentFiles, builtInSystemOptions: { showAttachments, showAllFileTypes }, }, } = this;
        const externalFilesEnabled = showAttachments || showAllFileTypes;
        // List of facetIds that depend on the corresponding feature being enabled
        const featureEnablementStatus = {
            [HeadingsListFacetIds.RecentFiles]: shouldSearchRecentFiles,
            [HeadingsListFacetIds.Bookmarks]: shouldSearchBookmarks,
            [HeadingsListFacetIds.Filenames]: shouldSearchFilenames,
            [HeadingsListFacetIds.Headings]: shouldSearchHeadings,
            [HeadingsListFacetIds.ExternalFiles]: externalFilesEnabled,
        };
        return this.getFacets(inputInfo.mode).filter((facet) => {
            // If the facetId exists in the feature list, set its availability to the
            // corresponding feature availability
            if (Object.prototype.hasOwnProperty.call(featureEnablementStatus, facet.id)) {
                facet.isAvailable = featureEnablementStatus[facet.id];
            }
            return facet.isAvailable;
        });
    }
    getSuggestions(inputInfo) {
        let suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm } = inputInfo.searchQuery;
            const { settings } = this;
            const activeFacetIds = this.getActiveFacetIds(inputInfo);
            const hasActiveFacets = !!activeFacetIds.size;
            if (hasSearchTerm || hasActiveFacets) {
                const { limit } = settings;
                const { app: { vault }, } = this;
                // initialize options
                const options = {
                    headings: settings.shouldSearchHeadings,
                    allHeadings: settings.searchAllHeadings,
                    aliases: settings.shouldShowAlias,
                    bookmarks: settings.shouldSearchBookmarks,
                    filename: settings.shouldSearchFilenames,
                    filenameAsFallback: !settings.strictHeadingsOnly,
                    unresolved: !settings.showExistingOnly,
                };
                this.getItems([vault.getRoot()], inputInfo, suggestions, activeFacetIds, options);
                obsidian.sortSearchResults(suggestions);
                if (limit > 0 && suggestions.length > limit) {
                    suggestions = suggestions.slice(0, limit);
                }
            }
            else {
                this.getSuggestionsForEditorsAndRecentFiles(inputInfo, suggestions, new Set(), { editors: true, recentFiles: settings.shouldSearchRecentFiles });
            }
        }
        return suggestions;
    }
    getItems(files, inputInfo, collection, activeFacetIds, options) {
        const hasActiveFacets = !!activeFacetIds.size;
        // Editors and recent files should only be displayed when there's no search term, or when
        // it's faceted with recentFiles
        const editorAndRecentOptions = { editors: false, recentFiles: false };
        this.getSuggestionsForEditorsAndRecentFiles(inputInfo, collection, activeFacetIds, editorAndRecentOptions);
        // Use the bookmark enabled state to determine whether or not to include them
        const bookmarkOptions = {
            fileBookmarks: options.bookmarks,
            nonFileBookmarks: options.bookmarks,
        };
        this.getSuggestionsForBookmarks(inputInfo, collection, activeFacetIds, bookmarkOptions);
        // Set up options for processing the collections of files
        const fileOptions = {
            headings: options.headings,
            allHeadings: options.allHeadings,
            aliases: options.aliases,
            filename: options.filename,
            filenameAsFallback: options.filenameAsFallback,
        };
        this.getSuggestionForFiles(inputInfo, files, collection, activeFacetIds, fileOptions);
        // Since there's no facet for unresolved, they should never show up when
        // facets are active.
        if (options.unresolved && !hasActiveFacets) {
            this.addUnresolvedSuggestions(collection, inputInfo.searchQuery.prepQuery);
        }
    }
    getSuggestionsForBookmarks(inputInfo, collection, activeFacetIds, options) {
        const hasActiveFacets = activeFacetIds.size;
        const { prepQuery } = inputInfo.searchQuery;
        const { fileBookmarks, nonFileBookmarks } = inputInfo.currentWorkspaceEnvList;
        if (hasActiveFacets) {
            const isBookmarkFacetEnabled = activeFacetIds.has(HeadingsListFacetIds.Bookmarks);
            options = Object.assign(options, {
                fileBookmarks: isBookmarkFacetEnabled,
                nonFileBookmarks: isBookmarkFacetEnabled,
            });
        }
        const processBookmarks = (bookmarkInfoList) => {
            for (const bookmarkInfo of bookmarkInfoList) {
                this.addBookmarkSuggestion(inputInfo, collection, prepQuery, bookmarkInfo);
            }
        };
        if (options.fileBookmarks) {
            fileBookmarks.forEach((bookmarkInfoList) => {
                processBookmarks(bookmarkInfoList);
            });
        }
        if (options.nonFileBookmarks) {
            processBookmarks(nonFileBookmarks);
        }
    }
    getSuggestionForFiles(inputInfo, files, collection, activeFacetIds, options) {
        const hasActiveFacets = !!activeFacetIds.size;
        if (hasActiveFacets) {
            const isHeadingsEnabled = this.isFacetedWith(activeFacetIds, HeadingsListFacetIds.Headings);
            const isExternalFilesEnabled = this.isFacetedWith(activeFacetIds, HeadingsListFacetIds.ExternalFiles);
            // Enable filename when external files facet is active, or, when the Filename
            // facet is active
            const isFilenameEnabled = isExternalFilesEnabled ||
                this.isFacetedWith(activeFacetIds, HeadingsListFacetIds.Filenames);
            let allHeadings = false;
            let filenameAsFallback = false;
            if (isHeadingsEnabled) {
                allHeadings = options.allHeadings === true;
                filenameAsFallback = options.filenameAsFallback === true;
            }
            options = Object.assign(options, {
                headings: isHeadingsEnabled,
                aliases: false,
                filename: isFilenameEnabled,
                allHeadings,
                filenameAsFallback,
            });
        }
        else {
            options = Object.assign({
                headings: true,
                allHeadings: true,
                aliases: true,
                filename: true,
                filenameAsFallback: true,
            }, options);
        }
        // If any of these options are true then every file needs to be processed.
        const shouldProcessFiles = [options.headings, options.aliases, options.filename].some((option) => option === true);
        if (shouldProcessFiles) {
            const { prepQuery } = inputInfo.searchQuery;
            const { excludeFolders } = this.settings;
            const isExcludedFolder = matcherFnForRegExList(excludeFolders);
            let nodes = Array.prototype.concat(files);
            while (nodes.length > 0) {
                const node = nodes.pop();
                if (isTFile(node)) {
                    if (this.shouldIncludeFile(node, activeFacetIds)) {
                        this.addSuggestionsForFile(inputInfo, collection, node, prepQuery, options);
                    }
                }
                else if (!isExcludedFolder(node.path)) {
                    nodes = nodes.concat(node.children);
                }
            }
        }
    }
    addSuggestionsForFile(inputInfo, suggestions, file, prepQuery, options) {
        let isH1Matched = false;
        if (options.headings) {
            isH1Matched = this.addHeadingSuggestions(inputInfo, suggestions, prepQuery, file, options.allHeadings);
        }
        if (options.filename || (!isH1Matched && options.filenameAsFallback)) {
            this.addFileSuggestions(inputInfo, suggestions, prepQuery, file);
        }
        if (options.aliases) {
            this.addAliasSuggestions(inputInfo, suggestions, prepQuery, file);
        }
    }
    shouldIncludeFile(file, activeFacetIds = new Set()) {
        let isIncluded = false;
        if (file) {
            const coreFileExtensions = new Set(['md', 'canvas']);
            const { extension } = file;
            const { app: { viewRegistry, metadataCache }, settings: { excludeObsidianIgnoredFiles, fileExtAllowList, builtInSystemOptions: { showAttachments, showAllFileTypes }, }, } = this;
            const isUserIgnored = excludeObsidianIgnoredFiles && metadataCache.isUserIgnored(file.path);
            if (!isUserIgnored) {
                if (activeFacetIds.has(HeadingsListFacetIds.ExternalFiles)) {
                    const externalFilesEnabled = showAttachments || showAllFileTypes;
                    isIncluded = !coreFileExtensions.has(extension) && externalFilesEnabled;
                }
                else {
                    const isExtAllowed = this.isExternalFileTypeAllowed(file, viewRegistry, showAttachments, showAllFileTypes, fileExtAllowList);
                    isIncluded = isExtAllowed || coreFileExtensions.has(extension);
                }
            }
        }
        return isIncluded;
    }
    isExternalFileTypeAllowed(file, viewRegistry, showAttachments, showAllFileTypes, fileExtAllowList) {
        const { extension } = file;
        let isAllowed = viewRegistry.isExtensionRegistered(extension)
            ? showAttachments
            : showAllFileTypes;
        if (!isAllowed) {
            const allowList = new Set(fileExtAllowList);
            isAllowed = allowList.has(extension);
        }
        return isAllowed;
    }
    addAliasSuggestions(inputInfo, suggestions, prepQuery, file) {
        const { metadataCache } = this.app;
        const frontMatter = metadataCache.getFileCache(file)?.frontmatter;
        if (frontMatter) {
            const aliases = FrontMatterParser.getAliases(frontMatter);
            let i = aliases.length;
            // create suggestions where there is a match with an alias
            while (i--) {
                const alias = aliases[i];
                const { match } = this.fuzzySearchWithFallback(prepQuery, alias);
                if (match) {
                    suggestions.push(this.createAliasSuggestion(inputInfo, alias, file, match));
                }
            }
        }
    }
    addFileSuggestions(inputInfo, suggestions, prepQuery, file) {
        const { match, matchType, matchText } = this.fuzzySearchWithFallback(prepQuery, null, file);
        if (match) {
            suggestions.push(this.createFileSuggestion(inputInfo, file, match, matchType, matchText));
        }
    }
    addBookmarkSuggestion(inputInfo, suggestions, prepQuery, bookmarkInfo) {
        const result = this.fuzzySearchWithFallback(prepQuery, bookmarkInfo.bookmarkPath);
        if (result.match) {
            const sugg = BookmarksHandler.createSuggestion(inputInfo.currentWorkspaceEnvList, bookmarkInfo, this.settings, this.app.metadataCache, result);
            suggestions.push(sugg);
        }
    }
    addHeadingSuggestions(inputInfo, suggestions, prepQuery, file, allHeadings) {
        const { metadataCache } = this.app;
        const headingList = metadataCache.getFileCache(file)?.headings ?? [];
        let h1 = null;
        let isH1Matched = false;
        let i = headingList.length;
        while (i--) {
            const heading = headingList[i];
            let isMatched = false;
            if (allHeadings) {
                isMatched = this.matchAndPushHeading(inputInfo, suggestions, prepQuery, file, heading);
            }
            if (heading.level === 1) {
                const { line } = heading.position.start;
                if (h1 === null || line < h1.position.start.line) {
                    h1 = heading;
                    isH1Matched = isMatched;
                }
            }
        }
        if (!allHeadings && h1) {
            isH1Matched = this.matchAndPushHeading(inputInfo, suggestions, prepQuery, file, h1);
        }
        return isH1Matched;
    }
    matchAndPushHeading(inputInfo, suggestions, prepQuery, file, heading) {
        const { match } = this.fuzzySearchWithFallback(prepQuery, heading.heading);
        if (match) {
            suggestions.push(this.createHeadingSuggestion(inputInfo, heading, file, match));
        }
        return !!match;
    }
    addUnresolvedSuggestions(suggestions, prepQuery) {
        const { metadataCache } = this.app;
        const { unresolvedLinks } = metadataCache;
        const unresolvedSet = new Set();
        const sources = Object.keys(unresolvedLinks);
        let i = sources.length;
        // create a distinct list of unresolved links
        while (i--) {
            // each source has an object with keys that represent the list of unresolved links
            // for that source file
            const sourcePath = sources[i];
            const links = Object.keys(unresolvedLinks[sourcePath]);
            let j = links.length;
            while (j--) {
                // unresolved links can be duplicates, use a Set to get a distinct list
                unresolvedSet.add(links[j]);
            }
        }
        const unresolvedList = Array.from(unresolvedSet);
        i = unresolvedList.length;
        // create suggestions where there is a match with an unresolved link
        while (i--) {
            const unresolved = unresolvedList[i];
            const result = this.fuzzySearchWithFallback(prepQuery, unresolved);
            if (result.matchType !== MatchType.None) {
                suggestions.push(StandardExHandler.createUnresolvedSuggestion(unresolved, result, this.settings, metadataCache));
            }
        }
    }
    createAliasSuggestion(inputInfo, alias, file, match) {
        let sugg = {
            alias,
            file,
            ...this.createSearchMatch(match, MatchType.Primary, alias),
            type: SuggestionType.Alias,
        };
        sugg = Handler.updateWorkspaceEnvListStatus(inputInfo.currentWorkspaceEnvList, sugg);
        return this.applyMatchPriorityPreferences(sugg);
    }
    createFileSuggestion(inputInfo, file, match, matchType, matchText) {
        let sugg = {
            file,
            match,
            matchType,
            matchText,
            type: SuggestionType.File,
        };
        sugg = Handler.updateWorkspaceEnvListStatus(inputInfo.currentWorkspaceEnvList, sugg);
        return this.applyMatchPriorityPreferences(sugg);
    }
    createHeadingSuggestion(inputInfo, item, file, match) {
        let sugg = {
            item,
            file,
            ...this.createSearchMatch(match, MatchType.Primary, item.heading),
            type: SuggestionType.HeadingsList,
        };
        sugg = Handler.updateWorkspaceEnvListStatus(inputInfo.currentWorkspaceEnvList, sugg);
        return this.applyMatchPriorityPreferences(sugg);
    }
    createSearchMatch(match, type, text) {
        let matchType = MatchType.None;
        let matchText = null;
        if (match) {
            matchType = type;
            matchText = text;
        }
        return {
            match,
            matchType,
            matchText,
        };
    }
    addRecentFilesSuggestions(file, inputInfo, prepQuery, collection) {
        const h1 = this.getFirstH1(file);
        const { match, matchType, matchText } = this.fuzzySearchWithFallback(prepQuery, h1?.heading, file);
        if (match) {
            let sugg;
            if (matchType === MatchType.Primary) {
                sugg = this.createHeadingSuggestion(inputInfo, h1, file, match);
            }
            else {
                sugg = this.createFileSuggestion(inputInfo, file, match, matchType, matchText);
            }
            collection.push(sugg);
        }
    }
    addOpenEditorSuggestions(leaf, inputInfo, prepQuery, collection) {
        const file = leaf?.view?.file;
        const { settings, app: { metadataCache }, } = this;
        const preferredTitle = EditorHandler.getPreferredTitle(leaf, settings.preferredSourceForTitle, metadataCache);
        const result = this.fuzzySearchWithFallback(prepQuery, preferredTitle, file);
        if (result.match) {
            const sugg = EditorHandler.createSuggestion(inputInfo.currentWorkspaceEnvList, leaf, file, settings, metadataCache, preferredTitle, result);
            collection.push(sugg);
        }
    }
    getSuggestionsForEditorsAndRecentFiles(inputInfo, collection, activeFacetIds, options) {
        const prepQuery = inputInfo.searchQuery?.prepQuery;
        if (activeFacetIds.has(HeadingsListFacetIds.RecentFiles)) {
            options = Object.assign(options, { editors: false, recentFiles: true });
        }
        else {
            options = Object.assign({ editors: true, recentFiles: true }, options);
        }
        if (options.editors) {
            const leaves = inputInfo.currentWorkspaceEnvList?.openWorkspaceLeaves;
            leaves?.forEach((leaf) => {
                this.addOpenEditorSuggestions(leaf, inputInfo, prepQuery, collection);
            });
        }
        if (options.recentFiles) {
            const files = inputInfo.currentWorkspaceEnvList?.mostRecentFiles;
            files?.forEach((file) => {
                if (this.shouldIncludeFile(file, activeFacetIds)) {
                    this.addRecentFilesSuggestions(file, inputInfo, prepQuery, collection);
                }
            });
        }
    }
    onNoResultsCreateAction(inputInfo, evt) {
        const filename = inputInfo.parsedCommand(Mode.HeadingsList)?.parsedInput;
        this.createFile(filename, evt);
        return true;
    }
}

const CANVAS_ICON_MAP = {
    file: 'lucide-file-text',
    text: 'lucide-sticky-note',
    link: 'lucide-globe',
    group: 'create-group',
};
class SymbolHandler extends Handler {
    getCommandString(sessionOpts) {
        const { settings } = this;
        return sessionOpts?.useActiveEditorAsSource
            ? settings.symbolListActiveEditorCommand
            : settings.symbolListCommand;
    }
    validateCommand(inputInfo, index, filterText, activeSuggestion, activeLeaf) {
        const cmd = inputInfo.parsedCommand(Mode.SymbolList);
        const sourceInfo = this.getSourceInfoForSymbolOperation(activeSuggestion, activeLeaf, index === 0, inputInfo.sessionOpts);
        if (sourceInfo) {
            inputInfo.mode = Mode.SymbolList;
            cmd.source = sourceInfo;
            cmd.index = index;
            cmd.parsedInput = filterText;
            cmd.isValidated = true;
        }
        return cmd;
    }
    async getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            this.inputInfo = inputInfo;
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const symbolCmd = inputInfo.parsedCommand(Mode.SymbolList);
            const items = await this.getItems(symbolCmd.source, hasSearchTerm);
            items.forEach((item) => {
                let shouldPush = true;
                let match = null;
                if (hasSearchTerm) {
                    match = obsidian.fuzzySearch(prepQuery, SymbolHandler.getSuggestionTextForSymbol(item));
                    shouldPush = !!match;
                }
                if (shouldPush) {
                    const { file } = symbolCmd.source;
                    suggestions.push({ type: SuggestionType.SymbolList, file, item, match });
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { item } = sugg;
            const parentElClasses = ['qsp-suggestion-symbol'];
            if (Object.prototype.hasOwnProperty.call(item, 'indentLevel') &&
                this.settings.symbolsInLineOrder &&
                !this.inputInfo?.searchQuery?.hasSearchTerm) {
                parentElClasses.push(`qsp-symbol-l${item.indentLevel}`);
            }
            this.addClassesToSuggestionContainer(parentEl, parentElClasses);
            const text = SymbolHandler.getSuggestionTextForSymbol(item);
            this.renderContent(parentEl, text, sugg.match);
            this.addSymbolIndicator(item, parentEl);
            handled = true;
        }
        return handled;
    }
    onChooseSuggestion(sugg, evt) {
        let handled = false;
        if (sugg) {
            const symbolCmd = this.inputInfo.parsedCommand();
            const { leaf, file } = symbolCmd.source;
            const openState = { active: true };
            const { item } = sugg;
            if (item.symbolType !== SymbolType.CanvasNode) {
                openState.eState = this.constructMDFileNavigationState(item).eState;
            }
            this.navigateToLeafOrOpenFileAsync(evt, file, openState, leaf, Mode.SymbolList).then(() => {
                const { symbol } = item;
                if (SymbolHandler.isCanvasSymbolPayload(item, symbol)) {
                    this.zoomToCanvasNode(this.getActiveLeaf().view, symbol);
                }
            }, (reason) => {
                console.log(`Switcher++: Unable to navigate to symbols for file ${file.path}`, reason);
            });
            handled = true;
        }
        return handled;
    }
    reset() {
        this.inputInfo = null;
    }
    getAvailableFacets(inputInfo) {
        const cmd = inputInfo.parsedCommand(Mode.SymbolList);
        const isCanvasFile = SymbolHandler.isCanvasFile(cmd?.source?.file);
        const facets = this.getFacets(inputInfo.mode);
        const canvasFacetIds = new Set(Object.values(CANVAS_NODE_FACET_ID_MAP));
        // get only the string values of SymbolType as they are used as the face ids
        const mdFacetIds = new Set(Object.values(SymbolType).filter((v) => isNaN(Number(v))));
        facets.forEach((facet) => {
            const { id } = facet;
            facet.isAvailable = isCanvasFile ? canvasFacetIds.has(id) : mdFacetIds.has(id);
        });
        return facets.filter((v) => v.isAvailable);
    }
    zoomToCanvasNode(view, nodeData) {
        if (SymbolHandler.isCanvasView(view)) {
            const canvas = view.canvas;
            const node = canvas.nodes.get(nodeData.id);
            canvas.selectOnly(node);
            canvas.zoomToSelection();
        }
    }
    constructMDFileNavigationState(symbolInfo) {
        const { start: { line, col }, end: endLoc, } = symbolInfo.symbol.position;
        // object containing the state information for the target editor,
        // start with the range to highlight in target editor
        return {
            eState: {
                active: true,
                focus: true,
                startLoc: { line, col },
                endLoc,
                line,
                cursor: {
                    from: { line, ch: col },
                    to: { line, ch: col },
                },
            },
        };
    }
    getSourceInfoForSymbolOperation(activeSuggestion, activeLeaf, isSymbolCmdPrefix, sessionOpts) {
        const prevInputInfo = this.inputInfo;
        let prevSourceInfo = null;
        let prevMode = Mode.Standard;
        if (prevInputInfo) {
            prevSourceInfo = prevInputInfo.parsedCommand().source;
            prevMode = prevInputInfo.mode;
        }
        // figure out if the previous operation was a symbol operation
        const hasPrevSymbolSource = prevMode === Mode.SymbolList && !!prevSourceInfo;
        const activeEditorInfo = this.getEditorInfo(activeLeaf);
        const activeSuggInfo = this.getSuggestionInfo(activeSuggestion);
        // Pick the source file for a potential symbol operation, prioritizing
        // any pre-existing symbol operation that was in progress
        let sourceInfo = null;
        if (hasPrevSymbolSource) {
            sourceInfo = prevSourceInfo;
        }
        else if (activeSuggInfo.isValidSource && !sessionOpts.useActiveEditorAsSource) {
            sourceInfo = activeSuggInfo;
        }
        else if (activeEditorInfo.isValidSource && isSymbolCmdPrefix) {
            // Check isSymbolCmdPrefix to prevent the case where an embedded command would
            // trigger this mode for the active editor.
            sourceInfo = activeEditorInfo;
        }
        return sourceInfo;
    }
    async getItems(sourceInfo, hasSearchTerm) {
        let items = [];
        let symbolsInLineOrder = false;
        let selectNearestHeading = false;
        if (!hasSearchTerm) {
            ({ selectNearestHeading, symbolsInLineOrder } = this.settings);
        }
        items = await this.getSymbolsFromSource(sourceInfo, symbolsInLineOrder);
        if (selectNearestHeading) {
            SymbolHandler.FindNearestHeadingSymbol(items, sourceInfo);
        }
        return items;
    }
    static FindNearestHeadingSymbol(items, sourceInfo) {
        const cursorLine = sourceInfo?.cursor?.line;
        // find the nearest heading to the current cursor pos, if applicable
        if (cursorLine) {
            let found = null;
            const headings = items.filter((v) => isHeadingCache(v.symbol));
            if (headings.length) {
                found = headings.reduce((acc, curr) => {
                    const { line: currLine } = curr.symbol.position.start;
                    const accLine = acc ? acc.symbol.position.start.line : -1;
                    return currLine > accLine && currLine <= cursorLine ? curr : acc;
                });
            }
            if (found) {
                found.isSelected = true;
            }
        }
    }
    async getSymbolsFromSource(sourceInfo, orderByLineNumber) {
        const { app: { metadataCache }, inputInfo, } = this;
        const ret = [];
        if (sourceInfo?.file) {
            const { file } = sourceInfo;
            const activeFacetIds = this.getActiveFacetIds(inputInfo);
            if (SymbolHandler.isCanvasFile(file)) {
                await this.addCanvasSymbolsFromSource(file, ret, activeFacetIds);
            }
            else {
                const symbolData = metadataCache.getFileCache(file);
                if (symbolData) {
                    const push = (symbols = [], symbolType) => {
                        if (this.shouldIncludeSymbol(symbolType, activeFacetIds)) {
                            symbols.forEach((symbol) => ret.push({ type: 'symbolInfo', symbol, symbolType }));
                        }
                    };
                    push(symbolData.headings, SymbolType.Heading);
                    push(symbolData.tags, SymbolType.Tag);
                    this.addLinksFromSource(symbolData.links, ret, activeFacetIds);
                    push(symbolData.embeds, SymbolType.Embed);
                    await this.addCalloutsFromSource(file, symbolData.sections?.filter((v) => v.type === 'callout'), ret, activeFacetIds);
                    if (orderByLineNumber) {
                        SymbolHandler.orderSymbolsByLineNumber(ret);
                    }
                }
            }
        }
        return ret;
    }
    shouldIncludeSymbol(symbolType, activeFacetIds) {
        let shouldInclude = false;
        if (typeof symbolType === 'string') {
            shouldInclude = this.isFacetedWith(activeFacetIds, symbolType);
        }
        else {
            shouldInclude =
                this.settings.isSymbolTypeEnabled(symbolType) &&
                    this.isFacetedWith(activeFacetIds, SymbolType[symbolType]);
        }
        return shouldInclude;
    }
    async addCanvasSymbolsFromSource(file, symbolList, activeFacetIds) {
        let canvasNodes;
        try {
            const fileContent = await this.app.vault.cachedRead(file);
            canvasNodes = JSON.parse(fileContent).nodes;
        }
        catch (e) {
            console.log(`Switcher++: error reading file to extract canvas node information. ${file.path} `, e);
        }
        if (Array.isArray(canvasNodes)) {
            canvasNodes.forEach((node) => {
                if (this.shouldIncludeSymbol(CANVAS_NODE_FACET_ID_MAP[node.type], activeFacetIds)) {
                    symbolList.push({
                        type: 'symbolInfo',
                        symbolType: SymbolType.CanvasNode,
                        symbol: { ...node },
                    });
                }
            });
        }
    }
    async addCalloutsFromSource(file, sectionCache, symbolList, activeFacetIds) {
        const { app: { vault }, } = this;
        const shouldInclude = this.shouldIncludeSymbol(SymbolType.Callout, activeFacetIds);
        if (shouldInclude && sectionCache?.length && file) {
            let fileContent = null;
            try {
                fileContent = await vault.cachedRead(file);
            }
            catch (e) {
                console.log(`Switcher++: error reading file to extract callout information. ${file.path} `, e);
            }
            if (fileContent) {
                for (const cache of sectionCache) {
                    const { start, end } = cache.position;
                    const calloutStr = fileContent.slice(start.offset, end.offset);
                    const match = calloutStr.match(/^> \[!([^\]]+)\][+-]?(.*?)(?:\n>|$)/);
                    if (match) {
                        const calloutType = match[1];
                        const calloutTitle = match[match.length - 1];
                        const symbol = {
                            calloutTitle: calloutTitle.trim(),
                            calloutType,
                            ...cache,
                        };
                        symbolList.push({
                            type: 'symbolInfo',
                            symbolType: SymbolType.Callout,
                            symbol,
                        });
                    }
                }
            }
        }
    }
    addLinksFromSource(linkData, symbolList, activeFacetIds) {
        const { settings } = this;
        linkData = linkData ?? [];
        if (this.shouldIncludeSymbol(SymbolType.Link, activeFacetIds)) {
            for (const link of linkData) {
                const type = getLinkType(link);
                const isExcluded = (settings.excludeLinkSubTypes & type) === type;
                if (!isExcluded) {
                    symbolList.push({
                        type: 'symbolInfo',
                        symbol: link,
                        symbolType: SymbolType.Link,
                    });
                }
            }
        }
    }
    static orderSymbolsByLineNumber(symbols) {
        const sorted = symbols.sort((a, b) => {
            const { start: aStart } = a.symbol.position;
            const { start: bStart } = b.symbol.position;
            const lineDiff = aStart.line - bStart.line;
            return lineDiff === 0 ? aStart.col - bStart.col : lineDiff;
        });
        let currIndentLevel = 0;
        sorted.forEach((si) => {
            let indentLevel = 0;
            if (isHeadingCache(si.symbol)) {
                currIndentLevel = si.symbol.level;
                indentLevel = si.symbol.level - 1;
            }
            else {
                indentLevel = currIndentLevel;
            }
            si.indentLevel = indentLevel;
        });
        return sorted;
    }
    static getSuggestionTextForSymbol(symbolInfo) {
        const { symbol } = symbolInfo;
        let text;
        if (isHeadingCache(symbol)) {
            text = symbol.heading;
        }
        else if (isTagCache(symbol)) {
            text = symbol.tag.slice(1);
        }
        else if (isCalloutCache(symbol)) {
            text = symbol.calloutTitle;
        }
        else if (SymbolHandler.isCanvasSymbolPayload(symbolInfo, symbol)) {
            text = SymbolHandler.getSuggestionTextForCanvasNode(symbol);
        }
        else {
            const refCache = symbol;
            ({ link: text } = refCache);
            const { displayText } = refCache;
            if (displayText && displayText !== text) {
                text += `|${displayText}`;
            }
        }
        return text;
    }
    static getSuggestionTextForCanvasNode(node) {
        let text = '';
        const accessors = {
            file: () => node.file,
            text: () => node.text,
            link: () => node.url,
            group: () => node.label,
        };
        const fn = accessors[node?.type];
        if (fn) {
            text = fn();
        }
        return text;
    }
    addSymbolIndicator(symbolInfo, parentEl) {
        const { symbolType, symbol } = symbolInfo;
        const flairElClasses = ['qsp-symbol-indicator'];
        const flairContainerEl = this.createFlairContainer(parentEl);
        if (isCalloutCache(symbol)) {
            flairElClasses.push(...['suggestion-flair', 'callout', 'callout-icon', 'svg-icon']);
            const calloutFlairEl = flairContainerEl.createSpan({
                cls: flairElClasses,
                // Obsidian 0.15.9: the icon glyph is set in css based on the data-callout attr
                attr: { 'data-callout': symbol.calloutType },
            });
            // Obsidian 0.15.9 the --callout-icon css prop holds the name of the icon glyph
            const iconName = calloutFlairEl.getCssPropertyValue('--callout-icon');
            obsidian.setIcon(calloutFlairEl, iconName);
        }
        else if (SymbolHandler.isCanvasSymbolPayload(symbolInfo, symbol)) {
            const icon = CANVAS_ICON_MAP[symbol.type];
            this.renderIndicator(flairContainerEl, flairElClasses, icon, null);
        }
        else {
            let indicator;
            if (isHeadingCache(symbol)) {
                indicator = HeadingIndicators[symbol.level];
            }
            else {
                indicator = SymbolIndicators[symbolType];
            }
            this.renderIndicator(flairContainerEl, flairElClasses, null, indicator);
        }
    }
    static isCanvasSymbolPayload(symbolInfo, payload) {
        return symbolInfo.symbolType === SymbolType.CanvasNode;
    }
    static isCanvasFile(sourceFile) {
        return sourceFile?.extension === 'canvas';
    }
    static isCanvasView(view) {
        return view?.getViewType() === 'canvas';
    }
}

const COMMAND_PALETTE_PLUGIN_ID = 'command-palette';
const RECENTLY_USED_COMMAND_IDS = [];
class CommandHandler extends Handler {
    getCommandString(_sessionOpts) {
        return this.settings?.commandListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        const cmd = inputInfo.parsedCommand(Mode.CommandList);
        if (this.getEnabledCommandPalettePluginInstance()) {
            inputInfo.mode = Mode.CommandList;
            cmd.index = index;
            cmd.parsedInput = filterText;
            cmd.isValidated = true;
        }
        return cmd;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const itemsInfo = this.getItems(inputInfo, hasSearchTerm);
            itemsInfo.forEach((info) => {
                let shouldPush = true;
                let match = null;
                if (hasSearchTerm) {
                    match = obsidian.fuzzySearch(prepQuery, info.cmd.name);
                    shouldPush = !!match;
                }
                if (shouldPush) {
                    suggestions.push(this.createSuggestion(info, match));
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { item, match, isPinned, isRecent } = sugg;
            this.addClassesToSuggestionContainer(parentEl, ['qsp-suggestion-command']);
            this.renderContent(parentEl, item.name, match);
            const flairContainerEl = this.createFlairContainer(parentEl);
            this.renderHotkeyForCommand(item.id, this.app, flairContainerEl);
            if (item.icon) {
                this.renderIndicator(flairContainerEl, [], item.icon);
            }
            if (isPinned) {
                this.renderIndicator(flairContainerEl, [], 'filled-pin');
            }
            else if (isRecent) {
                this.renderOptionalIndicators(parentEl, sugg, flairContainerEl);
            }
            handled = true;
        }
        return handled;
    }
    renderHotkeyForCommand(id, app, flairContainerEl) {
        try {
            const { hotkeyManager } = app;
            if (hotkeyManager.getHotkeys(id) || hotkeyManager.getDefaultHotkeys(id)) {
                const hotkeyStr = hotkeyManager.printHotkeyForCommand(id);
                if (hotkeyStr?.length) {
                    flairContainerEl.createEl('kbd', {
                        cls: 'suggestion-hotkey',
                        text: hotkeyStr,
                    });
                }
            }
        }
        catch (err) {
            console.log('Switcher++: error rendering hotkey for command id: ', id, err);
        }
    }
    onChooseSuggestion(sugg) {
        let handled = false;
        if (sugg) {
            const { item } = sugg;
            this.app.commands.executeCommandById(item.id);
            this.saveUsageToList(item.id, RECENTLY_USED_COMMAND_IDS);
            handled = true;
        }
        return handled;
    }
    saveUsageToList(commandId, recentCommandIds) {
        if (recentCommandIds) {
            const oldIndex = recentCommandIds.indexOf(commandId);
            if (oldIndex > -1) {
                recentCommandIds.splice(oldIndex, 1);
            }
            recentCommandIds.unshift(commandId);
            recentCommandIds.splice(25);
        }
    }
    getItems(inputInfo, includeAllCommands) {
        let items = [];
        const activeFacetIds = this.getActiveFacetIds(inputInfo);
        const hasActiveFacets = !!activeFacetIds.size;
        if (hasActiveFacets) {
            items = this.getPinnedAndRecentCommands(activeFacetIds);
        }
        else if (includeAllCommands) {
            items = this.getAllCommands();
        }
        else {
            const pinnedAndRecents = this.getPinnedAndRecentCommands(activeFacetIds);
            items = pinnedAndRecents.length ? pinnedAndRecents : this.getAllCommands();
        }
        return items;
    }
    getPinnedAndRecentCommands(activeFacetIds) {
        const items = [];
        const pinnedIdsSet = this.getPinnedCommandIds();
        const recentIdsSet = this.getRecentCommandIds();
        const findCommandInfo = (id) => {
            let cmdInfo = null;
            const cmd = this.app.commands.findCommand(id);
            if (cmd) {
                cmdInfo = {
                    isPinned: pinnedIdsSet.has(id),
                    isRecent: recentIdsSet.has(id),
                    cmd,
                };
            }
            return cmdInfo;
        };
        const addCommandInfo = (facetId, cmdIds) => {
            if (this.isFacetedWith(activeFacetIds, facetId)) {
                cmdIds.forEach((id) => {
                    const cmdInfo = findCommandInfo(id);
                    if (cmdInfo) {
                        items.push(cmdInfo);
                    }
                });
            }
        };
        addCommandInfo(CommandListFacetIds.Pinned, Array.from(pinnedIdsSet));
        const isPinnedFaceted = this.isFacetedWith(activeFacetIds, CommandListFacetIds.Pinned);
        // Remove any recently used ids that are also in the pinned list so they don't
        // appear twice in the result list when the pinned facet is enabled
        const recentIds = Array.from(recentIdsSet).filter(
        // When not pinned faceted then the recent item should be in the result list
        // but when it is pinned facted, the recent item should only be in the result list
        // when it does not already exist in the pinned list
        (id) => !isPinnedFaceted || (isPinnedFaceted && !pinnedIdsSet.has(id)));
        addCommandInfo(CommandListFacetIds.Recent, recentIds);
        return items;
    }
    getAllCommands() {
        const pinnedIdsSet = this.getPinnedCommandIds();
        const recentIdsSet = this.getRecentCommandIds();
        return this.app.commands
            .listCommands()
            ?.sort((a, b) => a.name.localeCompare(b.name))
            .map((cmd) => {
            return {
                isPinned: pinnedIdsSet.has(cmd.id),
                isRecent: recentIdsSet.has(cmd.id),
                cmd,
            };
        });
    }
    getPinnedCommandIds() {
        const ids = this.getEnabledCommandPalettePluginInstance()?.options?.pinned;
        return new Set(ids ?? []);
    }
    getRecentCommandIds() {
        return new Set(RECENTLY_USED_COMMAND_IDS);
    }
    createSuggestion(commandInfo, match) {
        const { cmd, isPinned, isRecent } = commandInfo;
        const sugg = {
            type: SuggestionType.CommandList,
            item: cmd,
            isPinned,
            isRecent,
            match,
        };
        return this.applyMatchPriorityPreferences(sugg);
    }
    getEnabledCommandPalettePluginInstance() {
        return getInternalEnabledPluginById(this.app, COMMAND_PALETTE_PLUGIN_ID);
    }
}

class RelatedItemsHandler extends Handler {
    getCommandString(sessionOpts) {
        const { settings } = this;
        return sessionOpts?.useActiveEditorAsSource
            ? settings.relatedItemsListActiveEditorCommand
            : settings.relatedItemsListCommand;
    }
    validateCommand(inputInfo, index, filterText, activeSuggestion, activeLeaf) {
        const cmd = inputInfo.parsedCommand(Mode.RelatedItemsList);
        const sourceInfo = this.getSourceInfo(activeSuggestion, activeLeaf, index === 0, inputInfo.sessionOpts);
        if (sourceInfo) {
            inputInfo.mode = Mode.RelatedItemsList;
            cmd.source = sourceInfo;
            cmd.index = index;
            cmd.parsedInput = filterText;
            cmd.isValidated = true;
        }
        return cmd;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            this.inputInfo = inputInfo;
            inputInfo.buildSearchQuery();
            const { hasSearchTerm } = inputInfo.searchQuery;
            const cmd = inputInfo.parsedCommand(Mode.RelatedItemsList);
            const items = this.getItems(cmd.source, inputInfo);
            items.forEach((item) => {
                const sugg = this.searchAndCreateSuggestion(inputInfo, item);
                if (sugg) {
                    suggestions.push(sugg);
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { file, matchType, match, item } = sugg;
            const iconMap = new Map([
                [RelationType.Backlink, 'links-coming-in'],
                [RelationType.DiskLocation, 'folder-tree'],
                [RelationType.OutgoingLink, 'links-going-out'],
            ]);
            parentEl.setAttribute('data-relation-type', item.relationType);
            this.renderAsFileInfoPanel(parentEl, ['qsp-suggestion-related'], sugg.preferredTitle, file, matchType, match);
            const flairContainerEl = this.renderOptionalIndicators(parentEl, sugg);
            if (sugg.item.count) {
                // show the count of backlinks
                this.renderIndicator(flairContainerEl, [], null, `${sugg.item.count}`);
            }
            // render the flair icon
            this.renderIndicator(flairContainerEl, ['qsp-related-indicator'], iconMap.get(item.relationType));
            handled = true;
        }
        return handled;
    }
    onChooseSuggestion(sugg, evt) {
        let handled = false;
        if (sugg) {
            const { file } = sugg;
            this.navigateToLeafOrOpenFile(evt, file, `Unable to open related file ${file.path}`);
            handled = true;
        }
        return handled;
    }
    getPreferredTitle(item, preferredSource) {
        let text = null;
        const { file, unresolvedText } = item;
        if (file) {
            if (preferredSource === 'H1') {
                text = this.getFirstH1(file)?.heading ?? null;
            }
        }
        else {
            const isUnresolved = !!unresolvedText?.length;
            if (isUnresolved) {
                text = unresolvedText;
            }
        }
        return text;
    }
    searchAndCreateSuggestion(inputInfo, item) {
        const { file, unresolvedText } = item;
        let result = { matchType: MatchType.None, match: null };
        const isUnresolved = file === null && unresolvedText?.length;
        const { currentWorkspaceEnvList, searchQuery: { hasSearchTerm, prepQuery }, } = inputInfo;
        const { settings, app: { metadataCache }, } = this;
        const preferredTitle = this.getPreferredTitle(item, settings.preferredSourceForTitle);
        if (hasSearchTerm) {
            result = this.fuzzySearchWithFallback(prepQuery, preferredTitle, file);
            if (result.matchType === MatchType.None) {
                return null;
            }
        }
        return isUnresolved
            ? StandardExHandler.createUnresolvedSuggestion(preferredTitle, result, settings, metadataCache)
            : this.createSuggestion(currentWorkspaceEnvList, item, result, preferredTitle);
    }
    getItems(sourceInfo, inputInfo) {
        const relatedItems = [];
        const { metadataCache } = this.app;
        const { file, suggestion } = sourceInfo;
        const enabledRelatedItems = new Set(this.settings.enabledRelatedItems);
        const activeFacetIds = this.getActiveFacetIds(inputInfo);
        const shouldIncludeRelation = (relationType) => {
            return (enabledRelatedItems.has(relationType) &&
                this.isFacetedWith(activeFacetIds, relationType));
        };
        if (shouldIncludeRelation(RelationType.Backlink)) {
            let targetPath = file?.path;
            let linkMap = metadataCache.resolvedLinks;
            if (isUnresolvedSuggestion(suggestion)) {
                targetPath = suggestion.linktext;
                linkMap = metadataCache.unresolvedLinks;
            }
            this.addBacklinks(targetPath, linkMap, relatedItems);
        }
        if (shouldIncludeRelation(RelationType.DiskLocation)) {
            this.addRelatedDiskFiles(file, relatedItems);
        }
        if (shouldIncludeRelation(RelationType.OutgoingLink)) {
            this.addOutgoingLinks(file, relatedItems);
        }
        return relatedItems;
    }
    addRelatedDiskFiles(sourceFile, collection) {
        const { excludeRelatedFolders, excludeOpenRelatedFiles } = this.settings;
        if (sourceFile) {
            const isExcludedFolder = matcherFnForRegExList(excludeRelatedFolders);
            let nodes = [...sourceFile.parent.children];
            while (nodes.length > 0) {
                const node = nodes.pop();
                if (isTFile(node)) {
                    const isSourceFile = node === sourceFile;
                    const isExcluded = isSourceFile ||
                        (excludeOpenRelatedFiles && !!this.findMatchingLeaf(node).leaf);
                    if (!isExcluded) {
                        collection.push({ file: node, relationType: RelationType.DiskLocation });
                    }
                }
                else if (!isExcludedFolder(node.path)) {
                    nodes = nodes.concat(node.children);
                }
            }
        }
    }
    addOutgoingLinks(sourceFile, collection) {
        if (sourceFile) {
            const destUnresolved = new Map();
            const destFiles = new Map();
            const { metadataCache } = this.app;
            const outgoingLinks = metadataCache.getFileCache(sourceFile).links ?? [];
            const incrementCount = (info) => info ? !!(info.count += 1) : false;
            outgoingLinks.forEach((linkCache) => {
                const destPath = linkCache.link;
                const destFile = metadataCache.getFirstLinkpathDest(destPath, sourceFile.path);
                let info;
                if (destFile) {
                    if (!incrementCount(destFiles.get(destFile)) && destFile !== sourceFile) {
                        info = { file: destFile, relationType: RelationType.OutgoingLink, count: 1 };
                        destFiles.set(destFile, info);
                        collection.push(info);
                    }
                }
                else {
                    if (!incrementCount(destUnresolved.get(destPath))) {
                        info = {
                            file: null,
                            relationType: RelationType.OutgoingLink,
                            unresolvedText: destPath,
                            count: 1,
                        };
                        destUnresolved.set(destPath, info);
                        collection.push(info);
                    }
                }
            });
        }
    }
    addBacklinks(targetPath, linkMap, collection) {
        for (const [originFilePath, destPathMap] of Object.entries(linkMap)) {
            if (originFilePath !== targetPath &&
                Object.prototype.hasOwnProperty.call(destPathMap, targetPath)) {
                const count = destPathMap[targetPath];
                const originFile = this.getTFileByPath(originFilePath);
                if (originFile) {
                    collection.push({
                        count,
                        file: originFile,
                        relationType: RelationType.Backlink,
                    });
                }
            }
        }
    }
    reset() {
        this.inputInfo = null;
    }
    getSourceInfo(activeSuggestion, activeLeaf, isPrefixCmd, sessionOpts) {
        const prevInputInfo = this.inputInfo;
        let prevSourceInfo = null;
        let prevMode = Mode.Standard;
        if (prevInputInfo) {
            prevSourceInfo = prevInputInfo.parsedCommand().source;
            prevMode = prevInputInfo.mode;
        }
        // figure out if the previous operation was a symbol operation
        const hasPrevSource = prevMode === Mode.RelatedItemsList && !!prevSourceInfo;
        const activeEditorInfo = this.getEditorInfo(activeLeaf);
        const activeSuggInfo = this.getSuggestionInfo(activeSuggestion);
        if (!activeSuggInfo.isValidSource && isUnresolvedSuggestion(activeSuggestion)) {
            // related items supports retrieving backlinks for unresolved suggestion, so
            // force UnresolvedSuggestion to be valid, even though it would otherwise not be
            activeSuggInfo.isValidSource = true;
        }
        // Pick the source file for the operation, prioritizing
        // any pre-existing operation that was in progress
        let sourceInfo = null;
        if (hasPrevSource) {
            sourceInfo = prevSourceInfo;
        }
        else if (activeSuggInfo.isValidSource && !sessionOpts.useActiveEditorAsSource) {
            sourceInfo = activeSuggInfo;
        }
        else if (activeEditorInfo.isValidSource && isPrefixCmd) {
            sourceInfo = activeEditorInfo;
        }
        return sourceInfo;
    }
    createSuggestion(currentWorkspaceEnvList, item, result, preferredTitle) {
        let sugg = {
            item,
            file: item?.file,
            type: SuggestionType.RelatedItemsList,
            preferredTitle,
            ...result,
        };
        sugg = Handler.updateWorkspaceEnvListStatus(currentWorkspaceEnvList, sugg);
        return this.applyMatchPriorityPreferences(sugg);
    }
}

class VaultHandler extends Handler {
    constructor() {
        super(...arguments);
        this.mobileVaultChooserMarker = {
            type: SuggestionType.VaultList,
            match: null,
            item: null,
            pathSegments: null,
        };
    }
    getCommandString(_sessionOpts) {
        return this.settings?.vaultListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        inputInfo.mode = Mode.VaultList;
        const cmd = inputInfo.parsedCommand(Mode.VaultList);
        cmd.index = index;
        cmd.parsedInput = filterText;
        cmd.isValidated = true;
        return cmd;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const items = obsidian.Platform.isDesktop
                ? this.getItems()
                : [this.mobileVaultChooserMarker];
            items.forEach((item) => {
                let shouldPush = true;
                if (hasSearchTerm) {
                    const results = this.fuzzySearchWithFallback(prepQuery, null, item.pathSegments);
                    Object.assign(item, results);
                    shouldPush = !!results.match;
                }
                if (shouldPush) {
                    suggestions.push(item);
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            this.addClassesToSuggestionContainer(parentEl, ['qsp-suggestion-vault']);
            handled = true;
            if (obsidian.Platform.isDesktop) {
                this.renderVaultSuggestion(sugg, parentEl);
            }
            else if (sugg === this.mobileVaultChooserMarker) {
                this.renderMobileHintSuggestion(parentEl);
            }
        }
        return handled;
    }
    renderMobileHintSuggestion(parentEl) {
        this.renderContent(parentEl, 'Show mobile vault chooser', null);
    }
    renderVaultSuggestion(sugg, parentEl) {
        const { pathSegments, matchType } = sugg;
        let { match } = sugg;
        let basenameMatch = null;
        if (matchType === MatchType.Basename) {
            basenameMatch = match;
            match = null;
        }
        const contentEl = this.renderContent(parentEl, pathSegments.basename, basenameMatch);
        const wrapperEl = contentEl.createDiv({ cls: ['suggestion-note', 'qsp-note'] });
        const iconEl = wrapperEl.createSpan({ cls: ['qsp-path-indicator'] });
        const pathEl = wrapperEl.createSpan({ cls: 'qsp-path' });
        obsidian.setIcon(iconEl, 'folder');
        obsidian.renderResults(pathEl, pathSegments.path, match);
    }
    onChooseSuggestion(sugg, _evt) {
        let handled = false;
        if (sugg) {
            if (obsidian.Platform.isDesktop) {
                // 12/8/23: "vault-open" is the Obsidian defined channel for open a vault
                handled = electron.ipcRenderer.sendSync('vault-open', sugg.pathSegments?.path, false);
            }
            else if (sugg === this.mobileVaultChooserMarker) {
                // It's the mobile app context, show the vault chooser
                this.app.openVaultChooser();
                handled = true;
            }
        }
        return handled;
    }
    getItems() {
        const items = [];
        try {
            // 12/8/23: "vault-list" is the Obsidian defined channel for retrieving
            // the vault list
            const vaultData = electron.ipcRenderer.sendSync('vault-list');
            if (vaultData) {
                for (const [id, { path, open }] of Object.entries(vaultData)) {
                    const basename = filenameFromPath(path);
                    const sugg = {
                        type: SuggestionType.VaultList,
                        match: null,
                        item: id,
                        isOpen: !!open,
                        pathSegments: { basename, path },
                    };
                    items.push(sugg);
                }
            }
        }
        catch (err) {
            console.log('Switcher++: error retrieving list of available vaults. ', err);
        }
        return items.sort((a, b) => a.pathSegments.basename.localeCompare(b.pathSegments.basename));
    }
}

const lastInputInfoByMode = {};
class ModeHandler {
    constructor(app, settings, exKeymap) {
        this.app = app;
        this.settings = settings;
        this.exKeymap = exKeymap;
        this.sessionOpts = {};
        this.noResultActionModes = [Mode.HeadingsList, Mode.WorkspaceList];
        // StandardExHandler one is special in that it is not a "full" handler,
        // and not attached to a mode, as a result it is not in the handlersByMode list
        const standardExHandler = new StandardExHandler(app, settings);
        const handlersByMode = new Map([
            [Mode.SymbolList, new SymbolHandler(app, settings)],
            [Mode.WorkspaceList, new WorkspaceHandler(app, settings)],
            [Mode.HeadingsList, new HeadingsHandler(app, settings)],
            [Mode.EditorList, new EditorHandler(app, settings)],
            [Mode.BookmarksList, new BookmarksHandler(app, settings)],
            [Mode.CommandList, new CommandHandler(app, settings)],
            [Mode.RelatedItemsList, new RelatedItemsHandler(app, settings)],
            [Mode.VaultList, new VaultHandler(app, settings)],
        ]);
        this.handlersByMode = handlersByMode;
        this.handlersByType = new Map([
            [SuggestionType.CommandList, handlersByMode.get(Mode.CommandList)],
            [SuggestionType.EditorList, handlersByMode.get(Mode.EditorList)],
            [SuggestionType.HeadingsList, handlersByMode.get(Mode.HeadingsList)],
            [SuggestionType.RelatedItemsList, handlersByMode.get(Mode.RelatedItemsList)],
            [SuggestionType.Bookmark, handlersByMode.get(Mode.BookmarksList)],
            [SuggestionType.SymbolList, handlersByMode.get(Mode.SymbolList)],
            [SuggestionType.WorkspaceList, handlersByMode.get(Mode.WorkspaceList)],
            [SuggestionType.VaultList, handlersByMode.get(Mode.VaultList)],
            [SuggestionType.File, standardExHandler],
            [SuggestionType.Alias, standardExHandler],
        ]);
        this.handlersByCommand = new Map([
            [settings.editorListCommand, handlersByMode.get(Mode.EditorList)],
            [settings.workspaceListCommand, handlersByMode.get(Mode.WorkspaceList)],
            [settings.headingsListCommand, handlersByMode.get(Mode.HeadingsList)],
            [settings.bookmarksListCommand, handlersByMode.get(Mode.BookmarksList)],
            [settings.commandListCommand, handlersByMode.get(Mode.CommandList)],
            [settings.symbolListCommand, handlersByMode.get(Mode.SymbolList)],
            [settings.symbolListActiveEditorCommand, handlersByMode.get(Mode.SymbolList)],
            [settings.relatedItemsListCommand, handlersByMode.get(Mode.RelatedItemsList)],
            [settings.vaultListCommand, handlersByMode.get(Mode.VaultList)],
            [
                settings.relatedItemsListActiveEditorCommand,
                handlersByMode.get(Mode.RelatedItemsList),
            ],
        ]);
        this.debouncedGetSuggestions = obsidian.debounce(this.getSuggestions.bind(this), settings.headingsSearchDebounceMilli, true);
        this.reset();
    }
    onOpen() {
        const { exKeymap, settings } = this;
        exKeymap.isOpen = true;
        if (settings.quickFilters?.shouldResetActiveFacets) {
            Object.values(settings.quickFilters.facetList).forEach((f) => (f.isActive = false));
        }
    }
    onClose() {
        this.exKeymap.isOpen = false;
    }
    setSessionOpenMode(mode, chooser, sessionOpts) {
        this.reset();
        chooser?.setSuggestions([]);
        if (mode !== Mode.Standard) {
            const openModeString = this.getHandler(mode).getCommandString(sessionOpts);
            Object.assign(this.sessionOpts, sessionOpts, { openModeString });
        }
        if (lastInputInfoByMode[mode]) {
            if ((mode === Mode.CommandList && this.settings.preserveCommandPaletteLastInput) ||
                (mode !== Mode.CommandList && this.settings.preserveQuickSwitcherLastInput)) {
                const lastInfo = lastInputInfoByMode[mode];
                this.lastInput = lastInfo.inputText;
            }
        }
    }
    insertSessionOpenModeOrLastInputString(inputEl) {
        const { sessionOpts, lastInput } = this;
        const openModeString = sessionOpts.openModeString ?? null;
        if (lastInput && lastInput !== openModeString) {
            inputEl.value = lastInput;
            // `openModeString` may `null` when in standard mode
            // otherwise `lastInput` starts with `openModeString`
            const startsNumber = openModeString ? openModeString.length : 0;
            inputEl.setSelectionRange(startsNumber, inputEl.value.length);
        }
        else if (openModeString !== null && openModeString !== '') {
            // update UI with current command string in the case were openInMode was called
            inputEl.value = openModeString;
            // reset to null so user input is not overridden the next time onInput is called
            sessionOpts.openModeString = null;
        }
        // the same logic as `openModeString`
        // make sure it will not override user's normal input.
        this.lastInput = null;
    }
    updateSuggestions(query, chooser, modal) {
        const { exKeymap, settings, sessionOpts } = this;
        let handled = false;
        // cancel any potentially previously running debounced getSuggestions call
        this.debouncedGetSuggestions.cancel();
        // get the currently active leaf across all rootSplits
        const activeLeaf = Handler.getActiveLeaf(this.app.workspace);
        const activeSugg = ModeHandler.getActiveSuggestion(chooser);
        const inputInfo = this.determineRunMode(query, activeSugg, activeLeaf, sessionOpts);
        this.inputInfo = inputInfo;
        const { mode } = inputInfo;
        lastInputInfoByMode[mode] = inputInfo;
        this.updatedKeymapForMode(inputInfo, chooser, modal, exKeymap, settings, activeLeaf);
        if (mode !== Mode.Standard) {
            if (mode === Mode.HeadingsList && inputInfo.parsedCommand().parsedInput?.length) {
                // if headings mode and user is typing a query, delay getting suggestions
                this.debouncedGetSuggestions(inputInfo, chooser, modal);
            }
            else {
                this.getSuggestions(inputInfo, chooser, modal);
            }
            handled = true;
        }
        return handled;
    }
    updatedKeymapForMode(inputInfo, chooser, modal, exKeymap, settings, activeLeaf) {
        const { mode } = inputInfo;
        const handler = this.getHandler(mode);
        const facetList = handler?.getAvailableFacets(inputInfo) ?? [];
        const handleFacetKeyEvent = (facets, isReset) => {
            if (isReset) {
                // cycle between making all facets active/inactive
                const hasActive = facets.some((v) => v.isActive === true);
                handler.activateFacet(facets, !hasActive);
            }
            else {
                // expect facets to contain only one item that needs to be toggled
                handler.activateFacet(facets, !facets[0].isActive);
            }
            // refresh the suggestion list after changing the list of active facets
            this.updatedKeymapForMode(inputInfo, chooser, modal, exKeymap, settings, activeLeaf);
            this.getSuggestions(inputInfo, chooser, modal);
            // prevent default handling of key press afterwards
            return false;
        };
        const keymapConfig = {
            mode,
            activeLeaf,
            facets: {
                facetList,
                facetSettings: settings.quickFilters,
                onToggleFacet: handleFacetKeyEvent.bind(this),
            },
        };
        exKeymap.updateKeymapForMode(keymapConfig);
    }
    renderSuggestion(sugg, parentEl) {
        const { inputInfo, settings: { overrideStandardModeBehaviors }, } = this;
        const { mode } = inputInfo;
        const isHeadingMode = mode === Mode.HeadingsList;
        let handled = false;
        const systemBehaviorPreferred = new Set([
            SuggestionType.Unresolved,
            SuggestionType.Bookmark,
        ]);
        if (sugg === null) {
            if (isHeadingMode) {
                // in Headings mode, a null suggestion should be rendered to allow for note creation
                const headingHandler = this.getHandler(mode);
                const searchText = inputInfo.parsedCommand(mode)?.parsedInput;
                headingHandler.renderFileCreationSuggestion(parentEl, searchText);
                handled = true;
            }
        }
        else if (!systemBehaviorPreferred.has(sugg.type)) {
            if (overrideStandardModeBehaviors || isHeadingMode || isExSuggestion(sugg)) {
                // when overriding standard mode, or, in Headings mode, StandardExHandler should
                // handle rendering for FileSuggestion and Alias suggestion
                const handler = this.getHandler(sugg);
                if (handler) {
                    if (mode === Mode.Standard) {
                        // suggestions in standard mode are created by core Obsidian and are
                        // missing some properties, try to add them
                        handler.addPropertiesToStandardSuggestions(inputInfo, sugg);
                    }
                    handled = handler.renderSuggestion(sugg, parentEl);
                }
            }
        }
        return handled;
    }
    onChooseSuggestion(sugg, evt) {
        const { inputInfo, settings: { overrideStandardModeBehaviors }, } = this;
        const { mode } = inputInfo;
        const isHeadingMode = mode === Mode.HeadingsList;
        let handled = false;
        const systemBehaviorPreferred = new Set([
            SuggestionType.Unresolved,
            SuggestionType.Bookmark,
        ]);
        if (sugg === null) {
            if (this.noResultActionModes.includes(mode)) {
                // In these modes, a null suggestion indicates that
                // the <enter to create> UI action was chosen
                const handler = this.getHandler(mode);
                handled = !!handler?.onNoResultsCreateAction(inputInfo, evt);
            }
        }
        else if (!systemBehaviorPreferred.has(sugg.type)) {
            if (overrideStandardModeBehaviors || isHeadingMode || isExSuggestion(sugg)) {
                // when overriding standard mode, or, in Headings mode, StandardExHandler should
                // handle the onChoose action for File and Alias suggestion so that
                // the preferOpenInNewPane setting can be handled properly
                const handler = this.getHandler(sugg);
                if (handler) {
                    handled = handler.onChooseSuggestion(sugg, evt);
                }
            }
        }
        return handled;
    }
    determineRunMode(query, activeSugg, activeLeaf, sessionOpts) {
        const input = query ?? '';
        const info = new InputInfo(input, Mode.Standard, sessionOpts);
        this.addWorkspaceEnvLists(info);
        if (input.length === 0) {
            this.reset();
        }
        this.validatePrefixCommands(info, activeSugg, activeLeaf, this.settings);
        return info;
    }
    getSuggestions(inputInfo, chooser, modal) {
        chooser.setSuggestions([]);
        const { mode } = inputInfo;
        const suggestions = this.getHandler(mode).getSuggestions(inputInfo);
        const setSuggestions = (suggs) => {
            if (suggs?.length) {
                chooser.setSuggestions(suggs);
                ModeHandler.setActiveSuggestion(mode, chooser);
            }
            else {
                if (this.noResultActionModes.includes(mode) &&
                    inputInfo.parsedCommand(mode).parsedInput) {
                    modal.onNoSuggestion();
                }
                else {
                    chooser.setSuggestions(null);
                }
            }
        };
        if (Array.isArray(suggestions)) {
            setSuggestions(suggestions);
        }
        else {
            suggestions.then((values) => {
                setSuggestions(values);
            }, (reason) => {
                console.log('Switcher++: error retrieving suggestions as Promise. ', reason);
            });
        }
    }
    removeEscapeCommandCharFromInput(inputInfo, escapeCmdChar, cmdStr) {
        const sansEscapeInput = inputInfo.inputTextSansEscapeChar.replace(new RegExp(`(?:${escapeRegExp(escapeCmdChar)})(?:${escapeRegExp(cmdStr)})`), cmdStr);
        inputInfo.inputTextSansEscapeChar = sansEscapeInput;
        return sansEscapeInput;
    }
    validatePrefixCommands(inputInfo, activeSugg, activeLeaf, config) {
        let cmdStr = null;
        let handler = null;
        const activeEditorCmds = [
            config.symbolListActiveEditorCommand,
            config.relatedItemsListActiveEditorCommand,
        ];
        const prefixCmds = [
            config.editorListCommand,
            config.workspaceListCommand,
            config.headingsListCommand,
            config.bookmarksListCommand,
            config.commandListCommand,
            config.vaultListCommand,
        ]
            .concat(activeEditorCmds)
            .map((v) => `(?:${escapeRegExp(v)})`)
            // account for potential overlapping command strings
            .sort((a, b) => b.length - a.length);
        // regex that matches any of the prefix commands
        const match = new RegExp(`^((?:${escapeRegExp(config.escapeCmdChar)})?)(${prefixCmds.join('|')})`).exec(inputInfo.inputText);
        if (match) {
            const containsNegation = !!match[1].length;
            cmdStr = match[2];
            if (containsNegation) {
                this.removeEscapeCommandCharFromInput(inputInfo, config.escapeCmdChar, cmdStr);
                cmdStr = null;
            }
            else {
                handler = this.getHandler(cmdStr);
            }
        }
        const isValidated = this.validateSourcedCommands(inputInfo, cmdStr, activeSugg, activeLeaf, config);
        if (!isValidated && handler) {
            inputInfo.sessionOpts.useActiveEditorAsSource = activeEditorCmds.includes(cmdStr);
            const filterText = inputInfo.inputTextSansEscapeChar.slice(cmdStr.length);
            handler.validateCommand(inputInfo, match.index, filterText, activeSugg, activeLeaf);
        }
    }
    validateSourcedCommands(inputInfo, parsedPrefixCmd, activeSugg, activeLeaf, config) {
        let isValidated = false;
        const unmatchedHandlers = [];
        const searchText = inputInfo.inputTextSansEscapeChar;
        // Headings, Bookmarks, and EditorList mode can have an embedded command
        const supportedModes = [
            config.editorListCommand,
            config.headingsListCommand,
            config.bookmarksListCommand,
        ];
        // A falsy parsedPrefixCmd indicates Standard mode since no prefix command was matched
        if (!parsedPrefixCmd || supportedModes.includes(parsedPrefixCmd)) {
            let match = null;
            const sourcedCmds = [config.symbolListCommand, config.relatedItemsListCommand]
                .map((v) => `(?:${escapeRegExp(v)})`)
                .sort((a, b) => b.length - a.length);
            const re = new RegExp(`((?:${escapeRegExp(config.escapeCmdChar)})?)(${sourcedCmds.join('|')})`, 'g');
            while ((match = re.exec(searchText)) !== null) {
                const containsNegation = !!match[1].length;
                const cmdStr = match[2];
                if (containsNegation) {
                    this.removeEscapeCommandCharFromInput(inputInfo, config.escapeCmdChar, cmdStr);
                }
                else {
                    const filterText = searchText.slice(re.lastIndex);
                    const handler = this.getHandler(cmdStr);
                    if (handler) {
                        const cmd = handler.validateCommand(inputInfo, match.index, filterText, activeSugg, activeLeaf);
                        isValidated = !!cmd?.isValidated;
                        // Find all sourced handlers that did not match
                        const unmatched = this.getSourcedHandlers().filter((v) => v !== handler);
                        unmatchedHandlers.push(...unmatched);
                    }
                    break;
                }
            }
        }
        // if unmatchedHandlers has items then there was a match, so reset all others
        // otherwise reset all sourced handlers
        this.resetSourcedHandlers(unmatchedHandlers.length ? unmatchedHandlers : null);
        return isValidated;
    }
    static setActiveSuggestion(mode, chooser) {
        // only symbol mode currently sets an active selection
        if (mode === Mode.SymbolList) {
            const index = chooser.values
                .filter((v) => isSymbolSuggestion(v))
                .findIndex((v) => v.item.isSelected);
            if (index !== -1) {
                chooser.setSelectedItem(index, null);
                chooser.suggestions[chooser.selectedItem].scrollIntoView(false);
            }
        }
    }
    static getActiveSuggestion(chooser) {
        let activeSuggestion = null;
        if (chooser?.values) {
            activeSuggestion = chooser.values[chooser.selectedItem];
        }
        return activeSuggestion;
    }
    reset() {
        this.inputInfo = new InputInfo();
        this.sessionOpts = {};
        this.resetSourcedHandlers();
    }
    resetSourcedHandlers(handlers) {
        handlers = handlers ?? this.getSourcedHandlers();
        handlers.forEach((handler) => handler?.reset());
    }
    getSourcedHandlers() {
        const sourcedModes = [Mode.RelatedItemsList, Mode.SymbolList];
        return sourcedModes.map((v) => this.getHandler(v));
    }
    addWorkspaceEnvLists(inputInfo) {
        if (inputInfo) {
            const openEditors = this.getHandler(Mode.EditorList).getItems();
            // Create a Set containing the files from all the open editors
            const openEditorFilesSet = openEditors
                .map((leaf) => leaf?.view?.file)
                .filter((file) => !!file)
                .reduce((collection, file) => collection.add(file), new Set());
            // Get the list of bookmarks split into file bookmarks and non-file bookmarks
            const { fileBookmarks, nonFileBookmarks } = this.getHandler(Mode.BookmarksList).getItems(null);
            const lists = inputInfo.currentWorkspaceEnvList;
            lists.openWorkspaceLeaves = new Set(openEditors);
            lists.openWorkspaceFiles = openEditorFilesSet;
            lists.fileBookmarks = fileBookmarks;
            lists.nonFileBookmarks = nonFileBookmarks;
            lists.attachmentFileExtensions = this.getAttachmentFileExtensions(this.app.viewRegistry, this.settings.fileExtAllowList);
            // Get the list of recently closed files excluding the currently open ones
            const maxCount = openEditorFilesSet.size + this.settings.maxRecentFileSuggestionsOnInit;
            lists.mostRecentFiles = this.getRecentFiles(openEditorFilesSet, maxCount);
        }
        return inputInfo;
    }
    getAttachmentFileExtensions(viewRegistry, exemptFileExtensions) {
        const extList = new Set();
        try {
            const coreExts = new Set(['md', 'canvas', ...exemptFileExtensions]);
            // Add the list of registered extensions to extList, excluding the markdown and canvas
            Object.keys(viewRegistry.typeByExtension).reduce((collection, ext) => {
                if (!coreExts.has(ext)) {
                    collection.add(ext);
                }
                return collection;
            }, extList);
        }
        catch (err) {
            console.log('Switcher++: error retrieving attachment list from ViewRegistry', err);
        }
        return extList;
    }
    getRecentFiles(ignoreFiles, maxCount = 75) {
        ignoreFiles = ignoreFiles ?? new Set();
        const recentFiles = new Set();
        if (maxCount > 0) {
            const { workspace, vault } = this.app;
            const recentFilePaths = workspace.getRecentFiles({
                showMarkdown: true,
                showCanvas: true,
                showNonImageAttachments: true,
                showImages: true,
                maxCount,
            });
            recentFilePaths?.forEach((path) => {
                const file = vault.getAbstractFileByPath(path);
                if (isTFile(file) && !ignoreFiles.has(file)) {
                    recentFiles.add(file);
                }
            });
        }
        return recentFiles;
    }
    inputTextForStandardMode(input) {
        const { mode, inputTextSansEscapeChar } = this.inputInfo;
        let searchText = input;
        if (mode === Mode.Standard && inputTextSansEscapeChar?.length) {
            searchText = inputTextSansEscapeChar;
        }
        return searchText;
    }
    getHandler(kind) {
        let handler;
        const { handlersByMode, handlersByType, handlersByCommand } = this;
        if (typeof kind === 'number') {
            handler = handlersByMode.get(kind);
        }
        else if (isOfType(kind, 'type')) {
            handler = handlersByType.get(kind.type);
        }
        else if (typeof kind === 'string') {
            handler = handlersByCommand.get(kind);
        }
        return handler;
    }
}

class SwitcherPlusKeymap {
    get isOpen() {
        return this._isOpen;
    }
    set isOpen(value) {
        this._isOpen = value;
    }
    constructor(app, scope, chooser, modal, config) {
        this.app = app;
        this.scope = scope;
        this.chooser = chooser;
        this.modal = modal;
        this.config = config;
        this.standardKeysInfo = [];
        this.customKeysInfo = [];
        this.savedStandardKeysInfo = [];
        this.standardInstructionsElSelector = '.prompt-instructions';
        this.standardInstructionsElDataValue = 'standard';
        this.facetKeysInfo = [];
        this.insertIntoEditorKeysInfo = [];
        this.modKey = 'Ctrl';
        this.modifierToPlatformStrMap = {
            Mod: 'Ctrl',
            Ctrl: 'Ctrl',
            Meta: 'Win',
            Alt: 'Alt',
            Shift: 'Shift',
        };
        if (obsidian.Platform.isMacOS) {
            this.modKey = 'Meta';
            this.modifierToPlatformStrMap = {
                Mod: '⌘',
                Ctrl: '⌃',
                Meta: '⌘',
                Alt: '⌥',
                Shift: '⇧',
            };
        }
        this.initKeysInfo();
        this.removeDefaultTabKeyBinding(scope, config);
        this.registerNavigationBindings(scope, config.navigationKeys);
        this.registerEditorTabBindings(scope);
        this.registerCloseWhenEmptyBindings(scope, config);
        this.addDataAttrToInstructionsEl(modal.containerEl, this.standardInstructionsElSelector, this.standardInstructionsElDataValue);
    }
    initKeysInfo() {
        const customFileBasedModes = [
            Mode.EditorList,
            Mode.HeadingsList,
            Mode.RelatedItemsList,
            Mode.BookmarksList,
            Mode.SymbolList,
        ];
        // standard mode keys that are registered by default, and
        // should be unregistered in custom modes, then re-registered in standard mode
        // example: { modifiers: 'Shift', key: 'Enter' }
        const standardKeysInfo = [];
        // custom mode keys that should be registered, then unregistered in standard mode
        // Note: modifiers should be a comma separated string of Modifiers
        // without any padding space characters
        const customKeysInfo = [
            {
                isInstructionOnly: true,
                modes: customFileBasedModes,
                modifiers: null,
                key: null,
                func: null,
                command: this.commandDisplayStr(['Mod'], '↵'),
                purpose: 'open in new tab',
            },
            {
                isInstructionOnly: true,
                modes: customFileBasedModes,
                modifiers: this.modKey,
                key: '\\',
                func: null,
                command: this.commandDisplayStr(['Mod'], '\\'),
                purpose: 'open to the right',
            },
            {
                isInstructionOnly: true,
                modes: customFileBasedModes,
                modifiers: `${this.modKey},Shift`,
                key: '\\',
                func: null,
                command: this.commandDisplayStr(['Mod', 'Shift'], '\\'),
                purpose: 'open below',
            },
            {
                isInstructionOnly: true,
                modes: customFileBasedModes,
                modifiers: this.modKey,
                key: 'o',
                func: null,
                command: this.commandDisplayStr(['Mod'], 'o'),
                purpose: 'open in new window',
            },
            {
                isInstructionOnly: true,
                modes: [Mode.CommandList],
                modifiers: null,
                key: null,
                func: null,
                command: `↵`,
                purpose: 'execute command',
            },
            {
                isInstructionOnly: true,
                modes: [Mode.WorkspaceList],
                modifiers: null,
                key: null,
                func: null,
                command: `↵`,
                purpose: 'open workspace',
            },
        ];
        this.standardKeysInfo.push(...standardKeysInfo);
        this.customKeysInfo.push(...customKeysInfo);
    }
    removeDefaultTabKeyBinding(scope, config) {
        if (config?.removeDefaultTabBinding) {
            // 07/04/2023: Obsidian registers a binding for Tab key that only returns false
            // remove this binding so Tab can be remapped
            const keymap = scope.keys.find(({ modifiers, key }) => modifiers === null && key === 'Tab');
            scope.unregister(keymap);
        }
    }
    registerNavigationBindings(scope, navConfig) {
        const regKeys = (keys, isNext) => {
            keys.forEach(({ modifiers, key }) => {
                scope.register(modifiers, key, (evt, _ctx) => {
                    this.navigateItems(evt, isNext);
                    return false;
                });
            });
        };
        regKeys(navConfig?.nextKeys ?? [], true);
        regKeys(navConfig?.prevKeys ?? [], false);
    }
    registerFacetBinding(scope, keymapConfig) {
        const { mode, facets } = keymapConfig;
        if (facets?.facetList?.length) {
            const { facetList, facetSettings, onToggleFacet } = facets;
            const { keyList, modifiers, resetKey, resetModifiers } = facetSettings;
            let currKeyListIndex = 0;
            let keyHandler;
            const registerFn = (modKeys, key, facetListLocal, isReset) => {
                return scope.register(modKeys, key, () => onToggleFacet(facetListLocal, isReset));
            };
            // register each of the facets to a corresponding key
            for (let i = 0; i < facetList.length; i++) {
                const facet = facetList[i];
                const facetModifiers = facet.modifiers ?? modifiers;
                let key;
                if (facet.key?.length) {
                    // has override key defined so use it instead of the default
                    key = facet.key;
                }
                else if (currKeyListIndex < keyList.length) {
                    // use up one of the default keys
                    key = keyList[currKeyListIndex];
                    ++currKeyListIndex;
                }
                else {
                    // override key is not defined and no default keys left
                    console.log(`Switcher++: unable to register hotkey for facet: ${facet.label} in mode: ${Mode[mode]} because a trigger key is not specified`);
                    continue;
                }
                keyHandler = registerFn(facetModifiers, key, [facet], false);
                this.facetKeysInfo.push({
                    facet,
                    command: key,
                    purpose: facet.label,
                    ...keyHandler,
                });
            }
            // register the toggle key
            keyHandler = registerFn(resetModifiers ?? modifiers, resetKey, facetList, true);
            this.facetKeysInfo.push({
                facet: null,
                command: resetKey,
                purpose: 'toggle all',
                ...keyHandler,
            });
        }
    }
    registerEditorTabBindings(scope) {
        const keys = [
            [[this.modKey], '\\'],
            [[this.modKey, 'Shift'], '\\'],
            [[this.modKey], 'o'],
        ];
        keys.forEach((v) => {
            scope.register(v[0], v[1], this.useSelectedItem.bind(this));
        });
    }
    registerCloseWhenEmptyBindings(scope, config) {
        const keymaps = config.closeWhenEmptyKeys;
        keymaps?.forEach(({ modifiers, key }) => {
            scope.register(modifiers, key, this.closeModalIfEmpty.bind(this));
        });
    }
    updateInsertIntoEditorCommand(mode, activeEditor, customKeysInfo, insertConfig) {
        const { isEnabled, keymap, insertableEditorTypes } = insertConfig;
        let keyInfo = null;
        if (isEnabled) {
            const excludedModes = [Mode.CommandList, Mode.WorkspaceList, Mode.VaultList];
            const activeViewType = activeEditor?.view?.getViewType();
            const isExcluded = (activeViewType && !insertableEditorTypes.includes(activeViewType)) ||
                excludedModes.includes(mode);
            if (!isExcluded) {
                keyInfo = customKeysInfo.find((v) => v.purpose === keymap.purpose);
                if (!keyInfo) {
                    const { modifiers, key, purpose } = keymap;
                    keyInfo = {
                        isInstructionOnly: false,
                        modes: [],
                        func: null,
                        command: this.commandDisplayStr(modifiers, key),
                        modifiers: modifiers.join(','),
                        key,
                        purpose,
                    };
                    customKeysInfo.push(keyInfo);
                }
                // update the handler to capture the active editor
                keyInfo.func = () => {
                    const { modal, chooser } = this;
                    modal.close();
                    const item = chooser.values?.[chooser.selectedItem];
                    this.insertIntoEditorAsLink(item, activeEditor, insertConfig);
                    return false;
                };
                keyInfo.modes = [mode];
            }
        }
        return keyInfo;
    }
    updateKeymapForMode(keymapConfig) {
        const { mode, activeLeaf } = keymapConfig;
        const { modal, scope, savedStandardKeysInfo, standardKeysInfo, customKeysInfo, facetKeysInfo, config: { insertLinkInEditor }, } = this;
        this.updateInsertIntoEditorCommand(mode, activeLeaf, customKeysInfo, insertLinkInEditor);
        const customKeymaps = customKeysInfo.filter((v) => !v.isInstructionOnly);
        this.unregisterKeys(scope, customKeymaps);
        // remove facet keys and reset storage array
        this.unregisterKeys(scope, facetKeysInfo);
        facetKeysInfo.length = 0;
        const customKeysToAdd = customKeymaps.filter((v) => v.modes?.includes(mode));
        if (mode === Mode.Standard) {
            this.registerKeys(scope, savedStandardKeysInfo);
            savedStandardKeysInfo.length = 0;
            // after (re)registering the standard keys, register any custom keys that
            // should also work in standard mode
            this.registerKeys(scope, customKeysToAdd);
            this.toggleStandardInstructions(modal.containerEl, true);
        }
        else {
            const standardKeysRemoved = this.unregisterKeys(scope, standardKeysInfo);
            if (standardKeysRemoved.length) {
                savedStandardKeysInfo.push(...standardKeysRemoved);
            }
            this.registerKeys(scope, customKeysToAdd);
            this.registerFacetBinding(scope, keymapConfig);
            this.showCustomInstructions(modal, keymapConfig, customKeysInfo, facetKeysInfo);
        }
    }
    registerKeys(scope, keymaps) {
        keymaps.forEach((keymap) => {
            const modifiers = keymap.modifiers.split(',');
            scope.register(modifiers, keymap.key, keymap.func);
        });
    }
    unregisterKeys(scope, keyInfo) {
        const keysToRemove = [...keyInfo];
        const removed = [];
        let i = scope.keys.length;
        while (i--) {
            const keymap = scope.keys[i];
            const foundIndex = keysToRemove.findIndex((kRemove) => {
                // when the 'Mod' modifier is registered, it gets translated to the platform
                // specific version 'Meta' on MacOS or Ctrl on others, so when unregistering
                // account for this conversion
                const kRemoveModifiers = kRemove.modifiers
                    .split(',')
                    .map((modifier) => (modifier === 'Mod' ? this.modKey : modifier))
                    .join(',');
                return kRemoveModifiers === keymap.modifiers && kRemove.key === keymap.key;
            });
            if (foundIndex >= 0) {
                scope.unregister(keymap);
                removed.push(keymap);
                keysToRemove.splice(foundIndex, 1);
            }
        }
        return removed;
    }
    addDataAttrToInstructionsEl(containerEl, selector, value) {
        const el = containerEl.querySelector(selector);
        el?.setAttribute('data-mode', value);
        return el;
    }
    clearCustomInstructions(containerEl) {
        const { standardInstructionsElSelector, standardInstructionsElDataValue } = this;
        const selector = `${standardInstructionsElSelector}:not([data-mode="${standardInstructionsElDataValue}"])`;
        const elements = containerEl.querySelectorAll(selector);
        elements.forEach((el) => el.remove());
    }
    toggleStandardInstructions(containerEl, shouldShow) {
        const { standardInstructionsElSelector } = this;
        let displayValue = 'none';
        if (shouldShow) {
            displayValue = '';
            this.clearCustomInstructions(containerEl);
        }
        const el = containerEl.querySelector(standardInstructionsElSelector);
        if (el) {
            el.style.display = displayValue;
        }
    }
    showCustomInstructions(modal, keymapConfig, keymapInfo, facetKeysInfo) {
        const { mode, facets } = keymapConfig;
        const { containerEl } = modal;
        const keymaps = keymapInfo.filter((keymap) => keymap.modes?.includes(mode));
        this.toggleStandardInstructions(containerEl, false);
        this.clearCustomInstructions(containerEl);
        this.renderFacetInstructions(modal, facets?.facetSettings, facetKeysInfo);
        modal.setInstructions(keymaps);
    }
    renderFacetInstructions(modal, facetSettings, facetKeysInfo) {
        if (facetKeysInfo?.length && facetSettings.shouldShowFacetInstructions) {
            const modifiersToString = (modifiers) => {
                return modifiers?.toString().replace(',', ' ');
            };
            const containerEl = modal.modalEl.createDiv('prompt-instructions');
            // render the preamble
            let instructionEl = containerEl.createDiv();
            instructionEl.createSpan({
                cls: 'prompt-instruction-command',
                text: `filters | ${modifiersToString(facetSettings.modifiers)}`,
            });
            // render each key instruction
            facetKeysInfo.forEach((facetKeyInfo) => {
                const { facet, command, purpose } = facetKeyInfo;
                let modifiers;
                let key;
                let activeCls = null;
                if (facet) {
                    // Note: the command only contain the key, the modifiers has to be derived
                    key = command;
                    modifiers = facet.modifiers;
                    if (facet.isActive) {
                        activeCls = ['qsp-filter-active'];
                    }
                }
                else {
                    // Note: only the reset key is expected to not have an associated facet
                    key = facetSettings.resetKey;
                    modifiers = facetSettings.resetModifiers;
                }
                // if a modifier is specified for this specific facet, it overrides the
                // default modifier so display that too. Otherwise, just show the key alone
                const commandDisplayText = modifiers
                    ? `(${modifiersToString(modifiers)}) ${key}`
                    : `${key}`;
                instructionEl = containerEl.createDiv();
                instructionEl.createSpan({
                    cls: 'prompt-instruction-command',
                    text: commandDisplayText,
                });
                instructionEl.createSpan({
                    cls: activeCls,
                    text: purpose,
                });
            });
        }
    }
    closeModalIfEmpty(evt, _ctx) {
        const { modal, config } = this;
        if (config.shouldCloseModalOnBackspace && !modal?.inputEl.value) {
            modal.close();
            evt.preventDefault();
        }
    }
    useSelectedItem(evt, _ctx) {
        this.chooser.useSelectedItem(evt);
    }
    insertIntoEditorAsLink(sugg, activeLeaf, insertConfig) {
        const { app: { workspace, fileManager, vault }, } = this;
        const activeMarkdownView = workspace.getActiveViewOfType(obsidian.MarkdownView);
        const isActiveMarkdown = activeMarkdownView?.leaf === activeLeaf;
        const activeFile = activeMarkdownView?.file;
        if (isActiveMarkdown && activeFile) {
            const linkStr = generateMarkdownLink(fileManager, vault, sugg, activeFile.path, insertConfig);
            if (linkStr) {
                activeMarkdownView.editor?.replaceSelection(linkStr);
            }
        }
    }
    navigateItems(evt, isNext) {
        const { isOpen, chooser } = this;
        if (isOpen) {
            let index = chooser.selectedItem;
            index = isNext ? ++index : --index;
            chooser.setSelectedItem(index, evt);
        }
    }
    commandDisplayStr(modifiers, key) {
        let displayStr = '';
        if (modifiers && key) {
            const { modifierToPlatformStrMap } = this;
            const modifierStr = modifiers
                .map((modifier) => {
                return modifierToPlatformStrMap[modifier]?.toLocaleLowerCase();
            })
                .join(' ');
            displayStr = `${modifierStr} ${key}`;
        }
        return displayStr;
    }
}

function createSwitcherPlus(app, plugin) {
    const SystemSwitcherModal = getSystemSwitcherInstance(app)
        ?.QuickSwitcherModal;
    if (!SystemSwitcherModal) {
        console.log('Switcher++: unable to extend system switcher. Plugin UI will not be loaded. Use the builtin switcher instead.');
        return null;
    }
    const SwitcherPlusModal = class extends SystemSwitcherModal {
        constructor(app, plugin) {
            super(app, plugin.options.builtInSystemOptions);
            this.plugin = plugin;
            const { options } = plugin;
            options.shouldShowAlias = this.shouldShowAlias;
            const exKeymap = new SwitcherPlusKeymap(app, this.scope, this.chooser, this, options);
            this.exMode = new ModeHandler(app, options, exKeymap);
        }
        openInMode(mode, sessionOpts) {
            this.exMode.setSessionOpenMode(mode, this.chooser, sessionOpts);
            super.open();
        }
        onOpen() {
            this.exMode.onOpen();
            super.onOpen();
        }
        onClose() {
            super.onClose();
            this.exMode.onClose();
        }
        updateSuggestions() {
            const { exMode, inputEl, chooser } = this;
            exMode.insertSessionOpenModeOrLastInputString(inputEl);
            if (!exMode.updateSuggestions(inputEl.value, chooser, this)) {
                super.updateSuggestions();
            }
        }
        getSuggestions(input) {
            const query = this.exMode.inputTextForStandardMode(input);
            return super.getSuggestions(query);
        }
        onChooseSuggestion(item, evt) {
            if (!this.exMode.onChooseSuggestion(item, evt)) {
                super.onChooseSuggestion(item, evt);
            }
        }
        renderSuggestion(value, parentEl) {
            if (!this.exMode.renderSuggestion(value, parentEl)) {
                super.renderSuggestion(value, parentEl);
            }
        }
    };
    return new SwitcherPlusModal(app, plugin);
}

/**
 * Creates a custom launcher button element by cloning then modifying coreLauncherButtonEl
 * @param  {Element} coreLauncherButtonEl the ootb system launcher button element
 * @param  {MobileLauncherConfig} launcherConfig
 * @param  {()=>void} onclickListener event handler to attach to the new custom button
 * @returns HTMLElement the new custom button element that was created
 */
function createQSPLauncherButton(coreLauncherButtonEl, launcherConfig, onclickListener) {
    let qspLauncherButtonEl = null;
    if (coreLauncherButtonEl) {
        // April 2024: cloneNode(true) should perform a deep copy, but does not copy
        // any event handlers that were attached using addEventListener(), which
        // corePlusButtonEl does use, so it can be safely cloned.
        // Additionally, cloneNode() will copy element ID/Name as well which could result
        // in duplicates, but corePlusButtonEl does not contain ID/Name so it's also safe
        qspLauncherButtonEl = coreLauncherButtonEl.cloneNode(true);
        if (qspLauncherButtonEl) {
            const { iconName, coreLauncherButtonIconSelector } = launcherConfig;
            qspLauncherButtonEl.addClass('qsp-mobile-launcher-button');
            qspLauncherButtonEl.addEventListener('click', onclickListener);
            if (iconName?.length) {
                // Override the core icon, if a custom icon file name is provided
                const iconEl = qspLauncherButtonEl.querySelector(coreLauncherButtonIconSelector);
                if (iconEl) {
                    obsidian.setIcon(iconEl, iconName);
                }
            }
        }
    }
    return qspLauncherButtonEl;
}
/**
 * Remove coreButtonEl from DOM and replaces it with qspButtonEl
 * @param  {Element} coreButtonEl
 * @param  {HTMLElement} qspButtonEl
 * @returns boolean True if succeeded
 */
function replaceCoreLauncherButtonWithQSPButton(coreButtonEl, qspButtonEl) {
    let isSuccessful = false;
    if (coreButtonEl && qspButtonEl) {
        // Hide the button before adding to DOM
        const initialDisplay = qspButtonEl.style.display;
        qspButtonEl.style.display = 'none';
        if (coreButtonEl.insertAdjacentElement('beforebegin', qspButtonEl)) {
            coreButtonEl.remove();
            isSuccessful = true;
        }
        qspButtonEl.style.display = initialDisplay;
    }
    return isSuccessful;
}
class MobileLauncher {
    /**
     * Overrides the default functionality of the "Plus" button on mobile platforms
     * to launch Switcher++ instead of the default system switcher.
     * @param  {App} app
     * @param  {MobileLauncherConfig} launcherConfig
     * @param  {()=>void} onclickListener event handler to attach to the new custom button
     * @returns HTMLElement the new launcher button element if created
     */
    static installMobileLauncherOverride(app, launcherConfig, onclickListener) {
        let qspLauncherButtonEl = null;
        // If it's not a mobile platform, or the override feature is disabled, or the
        // core launcher has already been overridden then do nothing.
        if (!obsidian.Platform.isMobile ||
            !launcherConfig.isEnabled ||
            MobileLauncher.coreMobileLauncherButtonEl) {
            return null;
        }
        // Find the system launcher button
        const coreLauncherButtonEl = app?.mobileNavbar?.containerEl?.querySelector(launcherConfig.coreLauncherButtonSelector);
        if (coreLauncherButtonEl) {
            const qspButtonEl = createQSPLauncherButton(coreLauncherButtonEl, launcherConfig, onclickListener);
            if (replaceCoreLauncherButtonWithQSPButton(coreLauncherButtonEl, qspButtonEl)) {
                MobileLauncher.coreMobileLauncherButtonEl = coreLauncherButtonEl;
                MobileLauncher.qspMobileLauncherButtonEl = qspButtonEl;
                qspLauncherButtonEl = qspButtonEl;
            }
        }
        return qspLauncherButtonEl;
    }
    static removeMobileLauncherOverride() {
        let isSuccessful = false;
        if (!MobileLauncher.coreMobileLauncherButtonEl) {
            return isSuccessful;
        }
        if (MobileLauncher.qspMobileLauncherButtonEl?.parentElement) {
            const qspButtonEl = MobileLauncher.qspMobileLauncherButtonEl;
            const coreButtonEl = MobileLauncher.coreMobileLauncherButtonEl;
            const initialDisplay = coreButtonEl.style.display;
            coreButtonEl.style.display = 'none';
            if (qspButtonEl.insertAdjacentElement('beforebegin', coreButtonEl)) {
                qspButtonEl.remove();
                MobileLauncher.qspMobileLauncherButtonEl = null;
                MobileLauncher.coreMobileLauncherButtonEl = null;
                isSuccessful = true;
            }
            coreButtonEl.style.display = initialDisplay;
        }
        return isSuccessful;
    }
}

const COMMAND_DATA = [
    {
        id: 'switcher-plus:open',
        name: 'Open in Standard Mode',
        mode: Mode.Standard,
        iconId: 'lucide-file-search',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-editors',
        name: 'Open in Editor Mode',
        mode: Mode.EditorList,
        iconId: 'lucide-file-edit',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-symbols',
        name: 'Open Symbols for selected suggestion or editor',
        mode: Mode.SymbolList,
        iconId: 'lucide-dollar-sign',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-symbols-active',
        name: 'Open Symbols for the active editor',
        mode: Mode.SymbolList,
        iconId: 'lucide-dollar-sign',
        ribbonIconEl: null,
        sessionOpts: { useActiveEditorAsSource: true },
    },
    {
        id: 'switcher-plus:open-workspaces',
        name: 'Open in Workspaces Mode',
        mode: Mode.WorkspaceList,
        iconId: 'lucide-album',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-headings',
        name: 'Open in Headings Mode',
        mode: Mode.HeadingsList,
        iconId: 'lucide-file-search',
        ribbonIconEl: null,
    },
    {
        // Note: leaving this id with the old starred plugin name so that user
        // don't have to update their hotkey mappings when they upgrade
        id: 'switcher-plus:open-starred',
        name: 'Open in Bookmarks Mode',
        mode: Mode.BookmarksList,
        iconId: 'lucide-bookmark',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-commands',
        name: 'Open in Commands Mode',
        mode: Mode.CommandList,
        iconId: 'run-command',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-related-items',
        name: 'Open Related Items for selected suggestion or editor',
        mode: Mode.RelatedItemsList,
        iconId: 'lucide-file-plus-2',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-related-items-active',
        name: 'Open Related Items for the active editor',
        mode: Mode.RelatedItemsList,
        iconId: 'lucide-file-plus-2',
        ribbonIconEl: null,
        sessionOpts: { useActiveEditorAsSource: true },
    },
    {
        id: 'switcher-plus:open-vaults',
        name: 'Open in Vaults Mode',
        mode: Mode.VaultList,
        iconId: 'vault',
        ribbonIconEl: null,
    },
];
class SwitcherPlusPlugin extends obsidian.Plugin {
    async onload() {
        const options = new SwitcherPlusSettings(this);
        await options.updateDataAndLoadSettings();
        this.options = options;
        this.addSettingTab(new SwitcherPlusSettingTab(this.app, this, options));
        this.registerRibbonCommandIcons();
        this.updateMobileLauncherButtonOverride(options.mobileLauncher.isEnabled);
        COMMAND_DATA.forEach(({ id, name, mode, iconId, sessionOpts }) => {
            this.registerCommand(id, name, mode, iconId, sessionOpts);
        });
    }
    onunload() {
        this.updateMobileLauncherButtonOverride(false);
    }
    registerCommand(id, name, mode, iconId, sessionOpts) {
        this.addCommand({
            id,
            name,
            icon: iconId,
            checkCallback: (checking) => {
                return this.createModalAndOpen(mode, checking, sessionOpts);
            },
        });
    }
    registerRibbonCommandIcons() {
        // remove any registered icons
        COMMAND_DATA.forEach((data) => {
            data.ribbonIconEl?.remove();
            data.ribbonIconEl = null;
        });
        // map to keyed object
        const commandDataByMode = COMMAND_DATA.reduce((acc, curr) => {
            acc[curr.mode] = curr;
            return acc;
        }, {});
        this.options.enabledRibbonCommands.forEach((command) => {
            const data = commandDataByMode[Mode[command]];
            if (data) {
                data.ribbonIconEl = this.addRibbonIcon(data.iconId, data.name, () => {
                    this.createModalAndOpen(data.mode, false);
                });
            }
        });
    }
    createModalAndOpen(mode, isChecking, sessionOpts) {
        // modal needs to be created dynamically (same as system switcher)
        // as system options are evaluated in the modal constructor
        const modal = createSwitcherPlus(this.app, this);
        if (!modal) {
            return false;
        }
        if (!isChecking) {
            modal.openInMode(mode, sessionOpts);
        }
        return true;
    }
    updateMobileLauncherButtonOverride(isEnabled) {
        if (isEnabled) {
            const onclickListener = () => {
                const modeString = this.options.mobileLauncher.modeString;
                const openMode = Mode[modeString];
                if (openMode) {
                    this.createModalAndOpen(openMode, false);
                }
            };
            MobileLauncher.installMobileLauncherOverride(this.app, this.options.mobileLauncher, onclickListener);
        }
        else {
            MobileLauncher.removeMobileLauncherOverride();
        }
    }
}

module.exports = SwitcherPlusPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVzL3NoYXJlZFR5cGVzLnRzIiwiLi4vLi4vc3JjL3V0aWxzL3V0aWxzLnRzIiwiLi4vLi4vc3JjL3V0aWxzL2Zyb250TWF0dGVyUGFyc2VyLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL2ZhY2V0Q29uc3RhbnRzLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3RzLWRlZXBtZXJnZS9lc20vaW5kZXguanMiLCIuLi8uLi9zcmMvc2V0dGluZ3Mvc3dpdGNoZXJQbHVzU2V0dGluZ3MudHMiLCIuLi8uLi9zcmMvc2V0dGluZ3Mvc2V0dGluZ3NUYWJTZWN0aW9uLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL2Jvb2ttYXJrc1NldHRpbmdzVGFiU2VjdGlvbi50cyIsIi4uLy4uL3NyYy9zZXR0aW5ncy9jb21tYW5kTGlzdFNldHRpbmdzVGFiU2VjdGlvbi50cyIsIi4uLy4uL3NyYy9zZXR0aW5ncy9yZWxhdGVkSXRlbXNTZXR0aW5nc1RhYlNlY3Rpb24udHMiLCIuLi8uLi9zcmMvc2V0dGluZ3MvZ2VuZXJhbFNldHRpbmdzVGFiU2VjdGlvbi50cyIsIi4uLy4uL3NyYy9zZXR0aW5ncy93b3Jrc3BhY2VTZXR0aW5nc1RhYlNlY3Rpb24udHMiLCIuLi8uLi9zcmMvc2V0dGluZ3MvZWRpdG9yU2V0dGluZ3NUYWJTZWN0aW9uLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL2hlYWRpbmdzU2V0dGluZ3NUYWJTZWN0aW9uLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL3N5bWJvbFNldHRpbmdzVGFiU2VjdGlvbi50cyIsIi4uLy4uL3NyYy9zZXR0aW5ncy92YXVsdExpc3RTZXR0aW5nc1RhYlNlY3Rpb24udHMiLCIuLi8uLi9zcmMvc2V0dGluZ3Mvc3dpdGNoZXJQbHVzU2V0dGluZ1RhYi50cyIsIi4uLy4uL3NyYy9zd2l0Y2hlclBsdXMvaW5wdXRJbmZvLnRzIiwiLi4vLi4vc3JjL0hhbmRsZXJzL2hhbmRsZXIudHMiLCIuLi8uLi9zcmMvSGFuZGxlcnMvd29ya3NwYWNlSGFuZGxlci50cyIsIi4uLy4uL3NyYy9IYW5kbGVycy9zdGFuZGFyZEV4SGFuZGxlci50cyIsIi4uLy4uL3NyYy9IYW5kbGVycy9lZGl0b3JIYW5kbGVyLnRzIiwiLi4vLi4vc3JjL0hhbmRsZXJzL2Jvb2ttYXJrc0hhbmRsZXIudHMiLCIuLi8uLi9zcmMvSGFuZGxlcnMvaGVhZGluZ3NIYW5kbGVyLnRzIiwiLi4vLi4vc3JjL0hhbmRsZXJzL3N5bWJvbEhhbmRsZXIudHMiLCIuLi8uLi9zcmMvSGFuZGxlcnMvY29tbWFuZEhhbmRsZXIudHMiLCIuLi8uLi9zcmMvSGFuZGxlcnMvcmVsYXRlZEl0ZW1zSGFuZGxlci50cyIsIi4uLy4uL3NyYy9IYW5kbGVycy92YXVsdEhhbmRsZXIudHMiLCIuLi8uLi9zcmMvc3dpdGNoZXJQbHVzL21vZGVIYW5kbGVyLnRzIiwiLi4vLi4vc3JjL3N3aXRjaGVyUGx1cy9zd2l0Y2hlclBsdXNLZXltYXAudHMiLCIuLi8uLi9zcmMvc3dpdGNoZXJQbHVzL3N3aXRjaGVyUGx1cy50cyIsIi4uLy4uL3NyYy9zd2l0Y2hlclBsdXMvbW9iaWxlTGF1bmNoZXIudHMiLCIuLi8uLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6bnVsbCwibmFtZXMiOlsicGFyc2VMaW5rdGV4dCIsIlNldHRpbmciLCJNb2RhbCIsIlBsdWdpblNldHRpbmdUYWIiLCJwcmVwYXJlUXVlcnkiLCJLZXltYXAiLCJQbGF0Zm9ybSIsInNldEljb24iLCJyZW5kZXJSZXN1bHRzIiwibm9ybWFsaXplUGF0aCIsImZ1enp5U2VhcmNoIiwiVmlldyIsIkZpbGVWaWV3Iiwic29ydFNlYXJjaFJlc3VsdHMiLCJpcGNSZW5kZXJlciIsImRlYm91bmNlIiwiTWFya2Rvd25WaWV3IiwiUGx1Z2luIl0sIm1hcHBpbmdzIjoiOzs7OztBQTBCQSxJQUFZLGlCQU1YLENBQUE7QUFORCxDQUFBLFVBQVksaUJBQWlCLEVBQUE7QUFDM0IsSUFBQSxpQkFBQSxDQUFBLGlC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
