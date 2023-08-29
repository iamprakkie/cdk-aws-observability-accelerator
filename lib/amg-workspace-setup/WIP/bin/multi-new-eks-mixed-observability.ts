import { configureApp } from '../lib/common/construct-utils';
import GrafanaOperatorConstruct from '../lib/multi-new-eks-mixed-observability-construct/GrafanaOperatorConstruct';
import * as cdk from 'aws-cdk-lib';
import * as AWS from 'aws-sdk';

const app = configureApp();
new GrafanaOperatorConstruct(app, 'multi-new-eks-mixed');

     
