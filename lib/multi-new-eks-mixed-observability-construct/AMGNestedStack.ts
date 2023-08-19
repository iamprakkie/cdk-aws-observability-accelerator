/*
* This construct creates AMG using L1 contstruct from aws-cdk-lib: https://github.com/aws/aws-cdk/tree/main/packages/aws-cdk-lib/aws-grafana
* sample reference: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-grafana-workspace.html#aws-resource-grafana-workspace--examples
*/ 
import { CfnWorkspace } from 'aws-cdk-lib/aws-grafana';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { NestedStack, NestedStackProps, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { PolicyStatement, Effect, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

/**
 * Defines properties for the AMG IAM setup. 
 */
export interface AMGNestedStackProps extends NestedStackProps {
    region: string,
    account: string
} 

export class AMGNestedStack extends NestedStack {
    constructor(scope: Construct, id: string, props: AMGNestedStackProps ) {
        super(scope, id, props);
        const stackId = `${id}-amg-workspace`;

        const account = this.account;
        const region = this.region;

        // Create role
        const workspaceRole = new Role(this, 'WorkspaceRole', {
            assumedBy: new ServicePrincipal('grafana.amazonaws.com').withConditions({
                StringEquals: {'aws:SourceAccount': `${account}`},
                StringLike: {'aws:SourceArn': `arn:aws:grafana:${region}:${account}:workspaces/*`}
            }),
            description: 'IAM Role for AMG'
        });

        // Inline policy for Amazon Managed Prometheus
        const AMGPrometheusPolicy = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "aps:ListWorkspaces",
                "aps:DescribeWorkspace",
                "aps:QueryMetrics",
                "aps:GetLabels",
                "aps:GetSeries",
                "aps:GetMetricMetadata"
            ],
            resources: ['*']
        });
  
        // workspaceRole.addToPrincipalPolicy(AMGPrometheusPolicy);
        workspaceRole.addToPolicy(AMGPrometheusPolicy);

        // Inline policy for SNS
        const AMGSNSPolicy = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "sns:Publish"
            ],
            resources: [`arn:aws:sns:*:${account}:grafana*`]
        });
  
        workspaceRole.addToPolicy(AMGSNSPolicy);        


        const workspace = new CfnWorkspace(this, stackId, {
            description: 'Amazon Managed Grafana Workspace created as part of CDK Observability Accelerator',
            accountAccessType: 'CURRENT_ACCOUNT', 
            roleArn: workspaceRole.roleArn,
            authenticationProviders: ['AWS_SSO'], // SSO providers 
            permissionType: 'SERVICE_MANAGED',
            dataSources: ['PROMETHEUS'],
            notificationDestinations: ['SNS']
        });

        new cdk.CfnOutput(this, 'WorkspaceEndpoint', { value: workspace ? workspace.attrEndpoint : "none" });
        new cdk.CfnOutput(this, 'WorkspaceID', { value: workspace ? workspace.attrId : "none" });
    }

    public static builder(): blueprints.NestedStackBuilder {
        return {
            build(scope: Construct, id: string, props: AMGNestedStackProps) {
                return new AMGNestedStack(scope, id, props);
            }
        };
    }    
}
