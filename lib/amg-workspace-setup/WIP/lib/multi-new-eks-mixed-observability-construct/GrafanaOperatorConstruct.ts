/*
* This construct created new EKS cluster using ObservabilityBuilder.
* Deploys GrafanaOperatorAddon, ExternalsSecretsAddOn, ArgoCDAddOn to deploy Grafana datasources & dashboards, and other required AddOns.
* Uses GrafanaOperatorSecretAddon to create ParameterStore ClusterSecretStore and ExternalSecret grafana-admin-credentials.
* Creates AMG through NestedStackAddOn 
*/
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { ObservabilityBuilder } from '../common/observability-builder';
import { GrafanaOperatorSecretAddon } from './grafanaoperatorsecretaddon';
import { AMGNestedStack, AMGNestedStackProps } from './AMGNestedStack';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import * as AWS from 'aws-sdk';
import { dependable } from '@aws-quickstart/eks-blueprints/dist/utils';

//pattern wide consts
const GITHUB_ORG = 'aws-samples';
const WORKLOAD_REPO = `git@github.com:${GITHUB_ORG}/eks-blueprints-workloads.git`;

export default class GrafanaOperatorConstruct {

    constructor(scope: Construct, id: string, inAccount?: string, inRegion?: string ) {
        const stackId = `${id}-observability-accelerator`;

        const account = inAccount! || process.env.COA_ACCOUNT_ID! || process.env.CDK_DEFAULT_ACCOUNT!;
        const region = inRegion! || process.env.COA_AWS_REGION! || process.env.CDK_DEFAULT_REGION!;

        // ArgoCD configuration
        const grafanaOperatorArgoAddonConfig = createArgoAddonConfig('monitoring','https://github.com/iamprakkie/one-observability-demo.git','grafana-operator-chart');
        // const grafanaOperatorArgoAddonConfig = createArgoAddonConfig('prod', 'https://github.com/aws-samples/one-observability-demo.git','grafana-operator-manifests'); 
        // const grafanaOperatorArgoAddonConfig = createArgoAddonConfig('dev','https://github.com/aws-samples/eks-blueprints-workloads.git','envs/dev');
        
        // AMG Configuration
        const AMGNestedStackProps: AMGNestedStackProps = {
            account: account,
            region: region
        }

        // AMG Nested Stack AddOn
        const amgNestedStackAddOn = new blueprints.NestedStackAddOn({
            id: 'amg-nestedstack',
            builder: AMGNestedStack.builder(AMGNestedStackProps),
        });


        Reflect.defineMetadata("ordered", true, blueprints.addons.GrafanaOperatorAddon); //sets metadata ordered to true for GrafanaOperatorAddon

        const addOns: Array<blueprints.ClusterAddOn> = [
            new blueprints.addons.KubeProxyAddOn(),
            new blueprints.addons.AwsLoadBalancerControllerAddOn(),
            new blueprints.addons.CertManagerAddOn(),
            new blueprints.addons.AdotCollectorAddOn(),
            new blueprints.addons.XrayAdotAddOn(),
            new blueprints.addons.ExternalsSecretsAddOn(),
            new blueprints.addons.GrafanaOperatorAddon({
                createNamespace: true,
            }),
            new GrafanaOperatorSecretAddon(),
            grafanaOperatorArgoAddonConfig, // GitOps through ArgoCD
            amgNestedStackAddOn // Creates AMG as part of Nested Stack
        ];

        ObservabilityBuilder.builder()
            .account(account)
            .region(region)
            .addNewClusterObservabilityBuilderAddOns()
            .addOns(...addOns)
            .build(scope, stackId);

    }

}

function createArgoAddonConfig(environment: string, repoUrl: string, repoPath?: string): blueprints.ArgoCDAddOn {
    return new blueprints.ArgoCDAddOn({
        bootstrapRepo: {
            repoUrl: repoUrl,
            path: repoPath! || '.',
            targetRevision: 'main',
            // credentialsSecretName: 'github-ssh-key', // for access to private repo. This needs SecretStoreAddOn added to your cluster
            // credentialsType: 'SSH',
        },
    });
}
