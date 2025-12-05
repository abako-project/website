#!/bin/bash

# API Client Test Runner
# Quick script to run API tests against deployed backend

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  API Client Test Runner${NC}"
echo -e "${BLUE}  Testing: https://dev.abako.xyz${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/tests/api-client.test.js" ]; then
    echo -e "${YELLOW}Warning: Not in website directory. Trying to navigate...${NC}"
    cd website/website 2>/dev/null || {
        echo -e "${YELLOW}Error: Cannot find test file. Please run from the website directory.${NC}"
        exit 1
    }
fi

# Parse command line arguments
SUITE=""
VERBOSE=""
SKIP_CONNECTIVITY=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--adapter)
            SUITE="adapter"
            shift
            ;;
        -v|--virto)
            SUITE="virto"
            shift
            ;;
        -c|--contracts)
            SUITE="contracts"
            shift
            ;;
        --verbose)
            VERBOSE="VERBOSE=true"
            shift
            ;;
        --skip-connectivity)
            SKIP_CONNECTIVITY="SKIP_CONNECTIVITY=true"
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -a, --adapter          Run only Adapter API tests"
            echo "  -v, --virto            Run only Virto API tests"
            echo "  -c, --contracts        Run only Contracts API tests"
            echo "  --verbose              Show detailed response data"
            echo "  --skip-connectivity    Skip connectivity checks"
            echo "  -h, --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                     # Run all tests"
            echo "  $0 --adapter           # Run only adapter tests"
            echo "  $0 --verbose           # Run all tests with verbose output"
            echo "  $0 --adapter --verbose # Run adapter tests with verbose output"
            exit 0
            ;;
        *)
            echo -e "${YELLOW}Unknown option: $1${NC}"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Build environment variables
ENV_VARS=""
if [ -n "$SUITE" ]; then
    ENV_VARS="${ENV_VARS}TEST_SUITE=${SUITE} "
fi
if [ -n "$VERBOSE" ]; then
    ENV_VARS="${ENV_VARS}${VERBOSE} "
fi
if [ -n "$SKIP_CONNECTIVITY" ]; then
    ENV_VARS="${ENV_VARS}${SKIP_CONNECTIVITY} "
fi

# Display what we're running
if [ -n "$SUITE" ]; then
    echo -e "${GREEN}Running ${SUITE} API tests...${NC}"
else
    echo -e "${GREEN}Running all API tests...${NC}"
fi
echo ""

# Run tests
eval "${ENV_VARS}node backend/tests/api-client.test.js"

# Capture exit code
EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Tests completed successfully!${NC}"
else
    echo -e "${YELLOW}✗ Some tests failed. See details above.${NC}"
fi

exit $EXIT_CODE
