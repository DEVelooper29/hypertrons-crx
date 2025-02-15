import React from 'react';
import { render } from 'react-dom';
import $ from 'jquery';
import PerceptorBase from '../PerceptorBase';
import { runsWhen, isPublicRepo, getGithubTheme } from '../utils/utils';
import { utils } from 'github-url-detection';
import RepoDetailPRView from '../views/RepoDetailPRView/RepoDetailPRView';

const githubTheme = getGithubTheme();

@runsWhen([isPublicRepo])
class RepoDetailPRAnchor extends PerceptorBase {
  private _currentRepo: string;

  constructor() {
    super();
    this._currentRepo = '';
  }

  public async run(): Promise<void> {
    // Ideally, we should do nothing if the container already exists. But
    // when I try to navigate back from profile page, I find tooltip won't
    // show though the related element exists. I think there might be something
    // else in javascript context, which is broken after navigation between
    // pages. So instead of doing nothing, I remove the container and reload
    // it again. At least this way works.
    if ($('#pr-tooltip-container').length > 0) {
      $('#pr-tooltip-container').remove();
    }

    this._currentRepo = utils.getRepositoryInfo(window.location)!.nameWithOwner;

    $('#pull-requests-tab').attr({
      'data-tip': '',
      'data-for': 'pr-tooltip',
      'data-class': `floating-window ${githubTheme}`,
      'data-place': 'bottom',
      'data-effect': 'solid',
      'data-delay-hide': 500,
      'data-delay-show': 1000,
      style: { color: githubTheme === 'light' ? '#24292f' : '#c9d1d9' },
      'data-text-color': githubTheme === 'light' ? '#24292F' : '#C9D1D9',
      'data-background-color': githubTheme === 'light' ? 'white' : '#161B22',
    });

    const tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'pr-tooltip-container';
    $('#repository-container-header').append(tooltipContainer);
    render(
      <RepoDetailPRView currentRepo={this._currentRepo} />,
      tooltipContainer
    );
  }
}

export default RepoDetailPRAnchor;
