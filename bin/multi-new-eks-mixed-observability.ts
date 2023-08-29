import { configureApp } from '../lib/common/construct-utils';
import GrafanaOperatorConstruct from '../lib/amg-workspace-setup/GrafanaOperatorConstruct';

const app = configureApp();
new GrafanaOperatorConstruct(app, 'single-new-eks-amg');
