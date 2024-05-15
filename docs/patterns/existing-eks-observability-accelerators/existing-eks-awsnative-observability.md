# Single Cluster AWS Native Observability

## Architecture

The following figure illustrates the architecture of the pattern we will be deploying for Existing EKS Cluster AWS Native Observability pattern, using AWS native tools such as CloudWatch and Logs and Open Source tools such as AWS Distro for OpenTelemetry (ADOT).

> [!NOTE]
> Currently, Xray AddOn is not supported for imported clusters. The Xray AddOn requires access to the nodegroup which is not available with the imported cluster and it does not support IRSA as of now and requires modification of the node instance role. Once it supports IRSA, we would update this pattern to work with the existing clusters.

![Architecture](../images/existing-eks-awsnative.png)

This example makes use of CloudWatch, as a metric and log aggregation layer. In order to collect the metrics and traces, we use the Open Source ADOT collector. Fluent Bit is used to export the logs to CloudWatch Logs.


## Objective

This pattern aims to add Observability on top of an existing EKS cluster, with AWS services.

## Prerequisites:

Ensure that you have installed the following tools on your machine:

1. [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
2. [kubectl](https://Kubernetes.io/docs/tasks/tools/)
3. [cdk](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install)
4. [npm](https://docs.npmjs.com/cli/v8/commands/npm-install)

You will also need:

1. Either an existing EKS cluster, or you can setup a new one with  [Single New EKS Cluster Observability Accelerator](../single-new-eks-observability-accelerators/single-new-eks-cluster.md)
2. An OpenID Connect (OIDC) provider, associated to the above EKS cluster (Note: Single EKS Cluster Pattern takes care of that for you)

## Deploying
!!! note If control plane logging is not enabled in the existing cluster, edit 
`lib/existing-eks-awsnative-observability-pattern/index.ts` to include `.enableControlPlaneLogging()` as shown below:
```typescript
    ObservabilityBuilder.builder()
        // some properties
        .enableControlPlaneLogging()
        // other properties
        .build(scope, stackId);
```


1. Edit `~/.cdk.json` by setting the name of your existing cluster:

```json
    "context": {
        ...
        "existing.cluster.name": "...",
        ...
    }
```

2. Edit `~/.cdk.json` by setting the kubectl role name; if you used Single New EKS Cluster Observability Accelerator to setup your cluster, the kubectl role name would be provided by the output of the deployment, on your command-line interface (CLI):

```json
    "context": {
        ...
        "existing.kubectl.rolename":"...",
        ...
    }
```

3. Run the following command from the root of this repository to deploy the pipeline stack:

```bash
make build
make pattern existing-eks-awsnative-observability deploy
```

## Verify the resources

Run update-kubeconfig command. You should be able to get the command from CDK output message.
```
aws eks update-kubeconfig --name single-new-eks-observability-accelerator --region <your-region> --role-arn arn:aws:iam::**************:role/single-new-eks-observabil-singleneweksobservabilit-CPAN247ASDF
```
Let’s verify the resources created by steps above.

```
kubectl get nodes -o wide
```

Output:
```
NAME                           STATUS   ROLES    AGE   VERSION
ip-10-0-145-216.ec2.internal   Ready    <none>   14m   v1.25.11-eks-a5565ad
```

Next, lets verify the namespaces in the cluster:
```
kubectl get ns # Output shows all namespace
```

Output:
```
NAME                       STATUS   AGE
amazon-cloudwatch          Active   5h36m
cert-manager               Active   5h36m
default                    Active   5h46m
kube-node-lease            Active   5h46m
kube-public                Active   5h46m
kube-system                Active   5h46m
prometheus-node-exporter   Active   5h36m
```

## Visualization
- Navigate to CloudWatch > Insights > Container Insights and select cluster, select `single-new-eks-cluster` if you created cluster with pattern mentioned from above guide, otherwise select relevant cluster.
- Now select `amazon-metrics` namepsace
![Container Insights - Namespace](../images/awsnative-container-insights-1.png)
- On a same view, select 'EKS Pods', which provides insights overview of all the pods as shown below
![Container Insights - EKS Pods](../images/awsnative-container-insights-2.png)

- Refer to "Using CloudWatch Logs Insights to Query Logs in [Logging](../../logs.md).

## Teardown

You can teardown the whole CDK stack with the following command:

```bash
make pattern existing-eks-awsnative-observability destroy
```

If you setup your cluster with Single New EKS Cluster Observability Accelerator, you also need to run:

```bash
make pattern single-new-eks-cluster destroy
```
