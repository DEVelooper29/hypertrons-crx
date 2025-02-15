import React, { useState, useEffect } from 'react';

import {
  getGithubTheme,
  getMessageByLocale,
  isNull,
  isAllNull,
} from '../../utils/utils';
import Settings, { loadSettings } from '../../utils/settings';
import { generateDataByMonth } from '../../utils/data';
import {
  getPROpened,
  getPRMerged,
  getPRReviews,
  getMergedCodeAddition,
  getMergedCodeDeletion,
} from '../../api/repo';
import ReactTooltip from 'react-tooltip';
import PRChart from './PRChart';
import MergedLinesChart from './MergedLinesChart';

const githubTheme = getGithubTheme();

interface RepoDetailPRViewProps {
  currentRepo: string;
}

const generatePRData = (PR: any): any => {
  return {
    PROpened: generateDataByMonth(PR.PROpened),
    PRMerged: generateDataByMonth(PR.PRMerged),
    PRReviews: generateDataByMonth(PR.PRReviews),
  };
};

const generateMergedLinesData = (PR: any): any => {
  return {
    mergedCodeAddition: generateDataByMonth(PR.mergedCodeAddition),
    mergedCodeDeletion: generateDataByMonth(PR.mergedCodeDeletion).map(
      (item) => {
        const dataItem = item;
        dataItem[1] = -item[1];
        return dataItem;
      }
    ),
  };
};

const RepoDetailPRView: React.FC<RepoDetailPRViewProps> = ({ currentRepo }) => {
  const [inited, setInited] = useState(false);
  const [settings, setSettings] = useState(new Settings());
  const [PR, setPR] = useState<any>();

  useEffect(() => {
    const initSettings = async () => {
      const temp = await loadSettings();
      setSettings(temp);
      setInited(true);
    };
    if (!inited) {
      initSettings();
    }
  }, [inited, settings]);

  useEffect(() => {
    (async () => {
      setPR({
        PROpened: await getPROpened(currentRepo),
        PRMerged: await getPRMerged(currentRepo),
        PRReviews: await getPRReviews(currentRepo),
        mergedCodeAddition: await getMergedCodeAddition(currentRepo),
        mergedCodeDeletion: await getMergedCodeDeletion(currentRepo),
      });
    })();
  }, []);

  if (isNull(PR) || isAllNull(PR)) return null;

  const onClick = (curMonth: string, params: any) => {
    const seriesIndex = params.seriesIndex;
    let type;
    if (seriesIndex === 0) {
      type = 'created';
    } else if (seriesIndex === 1) {
      type = 'merged';
    } else if (seriesIndex === 2) {
      type = 'updated';
    }
    let [year, month] = curMonth.toString().split(',')[0].split('-');
    if (month.length < 2) {
      month = '0' + month;
    }
    window.open(
      `/${currentRepo}/pulls?q=is:pr ${type}:${year}-${month} sort:updated-asc`
    );
  };

  return (
    <ReactTooltip id="pr-tooltip" clickable={true}>
      <div className="chart-title">
        {getMessageByLocale('pr_popup_title', settings.locale)}
      </div>
      <PRChart
        theme={githubTheme as 'light' | 'dark'}
        width={330}
        height={200}
        data={generatePRData(PR)}
        onClick={onClick}
      />
      <div className="chart-title">
        {getMessageByLocale('merged_lines_popup_title', settings.locale)}
      </div>
      <MergedLinesChart
        theme={githubTheme as 'light' | 'dark'}
        width={330}
        height={200}
        data={generateMergedLinesData(PR)}
      />
    </ReactTooltip>
  );
};

export default RepoDetailPRView;
