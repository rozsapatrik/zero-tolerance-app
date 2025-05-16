'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">zero-tolerance-app documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AdminModule.html" data-type="entity-link" >AdminModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AdminModule-43197a02555fa1cf8eebc780556655e1f0b931c567f46f54d6cf24241795b70e24420342deddcab233f6ff315a79bda5d57ffdb167ada28401c0c1d5a8dfe266"' : 'data-bs-target="#xs-components-links-module-AdminModule-43197a02555fa1cf8eebc780556655e1f0b931c567f46f54d6cf24241795b70e24420342deddcab233f6ff315a79bda5d57ffdb167ada28401c0c1d5a8dfe266"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AdminModule-43197a02555fa1cf8eebc780556655e1f0b931c567f46f54d6cf24241795b70e24420342deddcab233f6ff315a79bda5d57ffdb167ada28401c0c1d5a8dfe266"' :
                                            'id="xs-components-links-module-AdminModule-43197a02555fa1cf8eebc780556655e1f0b931c567f46f54d6cf24241795b70e24420342deddcab233f6ff315a79bda5d57ffdb167ada28401c0c1d5a8dfe266"' }>
                                            <li class="link">
                                                <a href="components/AdminFormComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdminPageComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminPageComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AdminRoutingModule.html" data-type="entity-link" >AdminRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppModule-1b0469f45b331ed21340b6ccccf8d84b0f73fea39567d394c63c63149cee86df98cfe4e9e17f80fa3a8c702b2dfa27c52ddcb204dd8f807653564921218d6475"' : 'data-bs-target="#xs-components-links-module-AppModule-1b0469f45b331ed21340b6ccccf8d84b0f73fea39567d394c63c63149cee86df98cfe4e9e17f80fa3a8c702b2dfa27c52ddcb204dd8f807653564921218d6475"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-1b0469f45b331ed21340b6ccccf8d84b0f73fea39567d394c63c63149cee86df98cfe4e9e17f80fa3a8c702b2dfa27c52ddcb204dd8f807653564921218d6475"' :
                                            'id="xs-components-links-module-AppModule-1b0469f45b331ed21340b6ccccf8d84b0f73fea39567d394c63c63149cee86df98cfe4e9e17f80fa3a8c702b2dfa27c52ddcb204dd8f807653564921218d6475"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AuthModule-5cd9d4630b62f9d4d56c37f51dd8bb9d4b25b4fe31636321263a290d6363be21a6d23425bfac5f01e64d26204238040631245e33a61086facf3ca2243caf362e"' : 'data-bs-target="#xs-components-links-module-AuthModule-5cd9d4630b62f9d4d56c37f51dd8bb9d4b25b4fe31636321263a290d6363be21a6d23425bfac5f01e64d26204238040631245e33a61086facf3ca2243caf362e"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AuthModule-5cd9d4630b62f9d4d56c37f51dd8bb9d4b25b4fe31636321263a290d6363be21a6d23425bfac5f01e64d26204238040631245e33a61086facf3ca2243caf362e"' :
                                            'id="xs-components-links-module-AuthModule-5cd9d4630b62f9d4d56c37f51dd8bb9d4b25b4fe31636321263a290d6363be21a6d23425bfac5f01e64d26204238040631245e33a61086facf3ca2243caf362e"' }>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegisterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegisterComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthRoutingModule.html" data-type="entity-link" >AuthRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CoreModule.html" data-type="entity-link" >CoreModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/PagesModule.html" data-type="entity-link" >PagesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-PagesModule-976a42c07ccce6c6a56cb685547e6c6b429d52b2b9c5944891cc6eb674b40853faf40a4f9b0a6f37c3bad8c09dd54368f1c32fb33d7fab11c980a86202d9333c"' : 'data-bs-target="#xs-components-links-module-PagesModule-976a42c07ccce6c6a56cb685547e6c6b429d52b2b9c5944891cc6eb674b40853faf40a4f9b0a6f37c3bad8c09dd54368f1c32fb33d7fab11c980a86202d9333c"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-PagesModule-976a42c07ccce6c6a56cb685547e6c6b429d52b2b9c5944891cc6eb674b40853faf40a4f9b0a6f37c3bad8c09dd54368f1c32fb33d7fab11c980a86202d9333c"' :
                                            'id="xs-components-links-module-PagesModule-976a42c07ccce6c6a56cb685547e6c6b429d52b2b9c5944891cc6eb674b40853faf40a4f9b0a6f37c3bad8c09dd54368f1c32fb33d7fab11c980a86202d9333c"' }>
                                            <li class="link">
                                                <a href="components/AboutUsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AboutUsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LandingPageComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LandingPageComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PageNotFoundComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PageNotFoundComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/PagesRoutingModule.html" data-type="entity-link" >PagesRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ProfileModule.html" data-type="entity-link" >ProfileModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-ProfileModule-d4a499176f42c8bad9bb3c569f56e7a1554ea42043c14fdf81d894915fa4cb4f7349f7f8d287222e076c6d1cb1d468b36ea7f41281e900b0b5c52c4fff0ff244"' : 'data-bs-target="#xs-components-links-module-ProfileModule-d4a499176f42c8bad9bb3c569f56e7a1554ea42043c14fdf81d894915fa4cb4f7349f7f8d287222e076c6d1cb1d468b36ea7f41281e900b0b5c52c4fff0ff244"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ProfileModule-d4a499176f42c8bad9bb3c569f56e7a1554ea42043c14fdf81d894915fa4cb4f7349f7f8d287222e076c6d1cb1d468b36ea7f41281e900b0b5c52c4fff0ff244"' :
                                            'id="xs-components-links-module-ProfileModule-d4a499176f42c8bad9bb3c569f56e7a1554ea42043c14fdf81d894915fa4cb4f7349f7f8d287222e076c6d1cb1d468b36ea7f41281e900b0b5c52c4fff0ff244"' }>
                                            <li class="link">
                                                <a href="components/ProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StatsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StatsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UpdateProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UpdateProfileComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProfileRoutingModule.html" data-type="entity-link" >ProfileRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SharedModule.html" data-type="entity-link" >SharedModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-SharedModule-883214ff68a1ce2f89c95f357748f5e047d856f23b8851efa1d54df42747d1d3a4305ff14c48aa5878bc1a12cd985046dff2deb9afcadd169934a938a86117c4"' : 'data-bs-target="#xs-components-links-module-SharedModule-883214ff68a1ce2f89c95f357748f5e047d856f23b8851efa1d54df42747d1d3a4305ff14c48aa5878bc1a12cd985046dff2deb9afcadd169934a938a86117c4"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SharedModule-883214ff68a1ce2f89c95f357748f5e047d856f23b8851efa1d54df42747d1d3a4305ff14c48aa5878bc1a12cd985046dff2deb9afcadd169934a938a86117c4"' :
                                            'id="xs-components-links-module-SharedModule-883214ff68a1ce2f89c95f357748f5e047d856f23b8851efa1d54df42747d1d3a4305ff14c48aa5878bc1a12cd985046dff2deb9afcadd169934a938a86117c4"' }>
                                            <li class="link">
                                                <a href="components/NavigationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NavigationComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-SharedModule-883214ff68a1ce2f89c95f357748f5e047d856f23b8851efa1d54df42747d1d3a4305ff14c48aa5878bc1a12cd985046dff2deb9afcadd169934a938a86117c4"' : 'data-bs-target="#xs-pipes-links-module-SharedModule-883214ff68a1ce2f89c95f357748f5e047d856f23b8851efa1d54df42747d1d3a4305ff14c48aa5878bc1a12cd985046dff2deb9afcadd169934a938a86117c4"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-SharedModule-883214ff68a1ce2f89c95f357748f5e047d856f23b8851efa1d54df42747d1d3a4305ff14c48aa5878bc1a12cd985046dff2deb9afcadd169934a938a86117c4"' :
                                            'id="xs-pipes-links-module-SharedModule-883214ff68a1ce2f89c95f357748f5e047d856f23b8851efa1d54df42747d1d3a4305ff14c48aa5878bc1a12cd985046dff2deb9afcadd169934a938a86117c4"' }>
                                            <li class="link">
                                                <a href="pipes/TrimDecimalsPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TrimDecimalsPipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/TrackingModule.html" data-type="entity-link" >TrackingModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-TrackingModule-6b2fea52f9af9ef2031939f9dc8a01a1999010279003b73583d1f8d6bb5896a04df779f76e1dc06f76648531d36d0292b36bf1ee211f1a4ce8320157069c8351"' : 'data-bs-target="#xs-components-links-module-TrackingModule-6b2fea52f9af9ef2031939f9dc8a01a1999010279003b73583d1f8d6bb5896a04df779f76e1dc06f76648531d36d0292b36bf1ee211f1a4ce8320157069c8351"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TrackingModule-6b2fea52f9af9ef2031939f9dc8a01a1999010279003b73583d1f8d6bb5896a04df779f76e1dc06f76648531d36d0292b36bf1ee211f1a4ce8320157069c8351"' :
                                            'id="xs-components-links-module-TrackingModule-6b2fea52f9af9ef2031939f9dc8a01a1999010279003b73583d1f8d6bb5896a04df779f76e1dc06f76648531d36d0292b36bf1ee211f1a4ce8320157069c8351"' }>
                                            <li class="link">
                                                <a href="components/DrinkListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DrinkListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HomeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HomeComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/TrackingRoutingModule.html" data-type="entity-link" >TrackingRoutingModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/UserModule.html" data-type="entity-link" >UserModule</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthenticationService.html" data-type="entity-link" >AuthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DateService.html" data-type="entity-link" >DateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotyfService.html" data-type="entity-link" >NotyfService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link" >UserService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AdminGuard.html" data-type="entity-link" >AdminGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/UserGuard.html" data-type="entity-link" >UserGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Drink.html" data-type="entity-link" >Drink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DrinkAmount.html" data-type="entity-link" >DrinkAmount</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DrinkAmountsMap.html" data-type="entity-link" >DrinkAmountsMap</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DrinkData.html" data-type="entity-link" >DrinkData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FirestoreDocumentData.html" data-type="entity-link" >FirestoreDocumentData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserData.html" data-type="entity-link" >UserData</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});