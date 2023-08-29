/*
* This nested stack creates SSM Parameter for storing AMG Workspace API key
*/ 
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StringParameter, StringParameterProps, ParameterTier, ParameterDataType, SecureStringParameterAttributes } from 'aws-cdk-lib/aws-ssm';
import { Key } from 'aws-cdk-lib/aws-kms';

export interface SSMParamNestedStackProps extends NestedStackProps {
    region: string,
    account: string
} 

export class SSMParamNestedStack extends NestedStack {
    constructor(scope: Construct, id: string, props: SSMParamNestedStackProps ) {
        super(scope, id, props);
        const stackId = `${id}-ssm-parameter`;

        const account = this.account;
        const region = this.region;

    // create SSM Paramter for AMG Workspace API key
    const ssmParamName="/cdk-accelerator/grafana-api-key"; // this is the name of SSM parameter referred in GrafanaOperatorSecretAddon

    const kmsKey = new Key(this, stackId);

    const secureStringProps: StringParameterProps = {
        parameterName: ssmParamName,
        stringValue: '<FILL IN WITH AMAZON GRAFANA WORKSPACE API KEY>',
        tier: ParameterTier.STANDARD,            
        dataType: ParameterDataType.TEXT
    };

    const ssmParamter = new StringParameter(this, stackId, secureStringProps);
    }

    public static builder(props: SSMParamNestedStackProps): blueprints.NestedStackBuilder {
        return {
            build(scope: Construct, id: string, props: SSMParamNestedStackProps) {
                return new SSMParamNestedStack(scope, id, props);
            }
        };
    }
}
