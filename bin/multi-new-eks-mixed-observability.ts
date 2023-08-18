import { configureApp } from '../lib/common/construct-utils';
import GrafanaOperatorConstruct from '../lib/multi-new-eks-mixed-observability-construct';

const app = configureApp();
new GrafanaOperatorConstruct(app, 'multi-new-eks-mixed');