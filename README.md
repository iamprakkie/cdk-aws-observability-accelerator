# AWS Observability Accelerator for CDK

Welcome to the AWS Observability Accelerator for CDK!

The AWS Observability Accelerator for CDK is a set of opinionated modules
to help you set up observability for your AWS environments with AWS Native services and AWS-managed observability services such as Amazon Managed Service for Prometheus,Amazon Managed Grafana, AWS Distro for OpenTelemetry (ADOT) and Amazon CloudWatch.

We provide curated metrics, logs, traces collection, cloudwatch dashboard, alerting rules and Grafana dashboards for your EKS infrastructure, Java/JMX, NGINX based workloads and your custom applications.

## Single EKS Cluster AWS Native Observability Accelerator

![AWSNative-Architecture](https://github.com/aws-observability/cdk-aws-observability-accelerator/blob/main/docs/images/cloud-native-arch.png?raw=true)

## Singe EKS Cluster Open Source Observability Accelerator

![OpenSource-Architecture](https://raw.githubusercontent.com/aws-observability/cdk-aws-observability-accelerator/811ec42307d41f35f2fec95f2f2b8a20bddc7646/docs/images/CDK_Architecture_diagram.png)

## Patterns

The individual patterns can be found in the `lib` directory.  Most of the patterns are self-explanatory, for some more complex examples please use this guide and docs/patterns directory for more information.

## Documentation

Please refer to the AWS CDK Observability Accelertor [documentation site](https://aws-observability.github.io/cdk-aws-observability-accelerator/) for complete project documentation.

Refer to following links for more details on patterns:

- [Single New EKS Cluster AWS Native Observability Accelerator](https://aws-observability.github.io/cdk-aws-observability-accelerator/patterns/single-new-eks-observability-accelerators/single-new-eks-native-observability/)
- [Single New EKS Cluster Open Source Observability Accelerator](https://aws-observability.github.io/cdk-aws-observability-accelerator/patterns/single-new-eks-observability-accelerators/single-new-eks-opensource-observability/)
- [Single New EKS Graviton Cluster Open Source Observability Accelerator](https://aws-observability.github.io/cdk-aws-observability-accelerator/patterns/single-new-eks-observability-accelerators/single-new-eks-graviton-opensource-observability/)


## Usage
Before proceeding, make sure [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) is installed on your machine.

To use the eks-blueprints and patterns module, you must have [Node.js](https://nodejs.org/en/) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed. You will also use `make` to simplify build and other common actions. 

### Setup Enviornment

Follow the below steps to setup and leverage `cdk-aws-observability-accelerator` in your environment.

1. Install `make`. For **Mac**, use brew
    ```bash
    brew install make
    ```
    For **CentOS, RHEL, Fedora**, use yum
    ```bash
    sudo yum install make
    ```

    For **Ubuntu, Debian**, use apt
    ```bash
    sudo apt install make
    ```

1. Clone `cdk-aws-observability-accelerator` repository
    ```bash
    git clone https://github.com/aws-observability/cdk-aws-observability-accelerator.git
    cd cdk-aws-observability-accelerator
    ```
    PS: If you are contributing to this repo, please make sure to fork the repo, add your changes and create a PR against it.

1. Once you have cloned the repo, you can open it using your favourite IDE and run the below commands to install the dependencies and build the existing patterns.
    - Install project dependencies.
    ```bash
    make -s deps
    ```
1. For **non MacOS** environments, load `nvm`
    ```bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    ```


1. Make sure the following pre-requisites are met:
    - Node version is a current stable node version 18.x.
    ```bash
    node -v
    v18.12.1
    ```

    Update (provided Node version manager is installed): `n stable`. May require `sudo`.
    -  NPM version must be 8.4 or above:

    ```bash
    npm -v
    8.19.2
    ```

    Updating npm: `sudo n stable` where stable can also be a specific version above 8.4. May require `sudo`.

1. To view patterns that are available to be deployed, execute the following:
    ```bash
    npm i
    make build
    ```

1. To list the existing CDK AWS Observability accelerator patterns, execute the following:
    ```bash
    make list
    ```
    Note: Some patterns have a hard dependency on AWS Secrets (for example GitHub access tokens). Initially you will see errors complaining about lack of the required secrets. It is normal. At the bottom, it will show the list of patterns which can be deployed, in case the pattern you are looking for is not available, it is due to the hard dependency which can be fixed by following the docs specific to those patterns.

1. To work with patterns use:
    ```bash
    make pattern <pattern-name> <list | deploy | synth | destroy>
    
    Example:
    make pattern single-new-eks-opensource-observability list
    
    Patterns:
    
    single-new-eks-awsnative-observability
    single-new-eks-mixed-observability
    single-new-eks-opensource-observability
    ```

1. Bootstrap your CDK environment.
    ```bash
    npx cdk bootstrap
    ```

1. You can then deploy a specific pattern with the following:
    ```bash
    make pattern single-new-eks-opensource-observability deploy
    ```

# Developer Flow

## Modifications

All files are compiled to the dist folder including `lib` and `bin` directories. For iterative development (e.g. if you make a change to any of the patterns) make sure to run compile:

```bash
make compile
```

The `compile` command is optimized to build only modified files and is fast. 

## New Patterns

To create a new pattern, please follow these steps:

1. Under lib create a folder for your pattern, such as `<pattern-name>-construct`. If you plan to create a set of patterns that represent a particular subdomain, e.g. `security` or `hardening`, please create an issue to discuss it first. If approved, you will be able to create a folder with your subdomain name and group your pattern constructs under it. 
2. Blueprints generally don't require a specific class, however we use a convention of wrapping each pattern in a plain class like `<Pattern-Name>Construct`. This class is generally placed in `index.ts` under your pattern folder. 
3. Once the pattern implementation is ready, you need to include it in the list of the patterns by creating a file `bin/<pattern-name>.ts`. The implementation of this file is very light, and it is done to allow patterns to run independently.

Example simple synchronous pattern:
```typescript
import SingleNewEksOpenSourceobservabilityConstruct from '../lib/single-new-eks-opensource-observability-construct';
import { configureApp } from '../lib/common/construct-utils';

const app = configureApp();

new SingleNewEksOpenSourceobservabilityConstruct(app, 'single-new-eks-opensource');
 // configureApp() will create app and configure loggers and perform other prep steps
```

## Security

See [CONTRIBUTING](./contributors.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
